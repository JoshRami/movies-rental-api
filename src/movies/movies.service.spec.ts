import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { MoviesService } from './movies.service';
import * as MoviesMock from './mocks/movies-mocks';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './movies.entity';
import { TagsService } from '../tags/tags.service';
import { mockTags } from './mocks/tags.mocks';
import { UsersService } from '../users/users.service';
import { RentsService } from '../rents/rents.service';
import { PurchasesService } from '../purchases/purchases.service';
import { mockUserModel } from '../users/mocks/user-mocks';
import { MailerService } from '@nestjs-modules/mailer';
import { SortingOptionsEnum } from './enums/sorting.enum';
import { mockPurchase } from '../purchases/mocks/purchases.mocks';
import { mockRentModel } from '../rents/mocks/rents.mocks';

describe('MoviesService', () => {
  let service: MoviesService;

  const mockRepo = {
    create: jest.fn().mockReturnValue(MoviesMock.mockMovieModel),
    save: jest.fn().mockReturnValue(MoviesMock.mockMovieModel),
    delete: jest.fn().mockReturnValue({ affected: 1 }),
    findOne: jest.fn().mockReturnValue(MoviesMock.mockMovieModel),
    find: jest.fn().mockReturnValue(MoviesMock.mockMovies),
  };

  const mockTagsServices = {
    getTagsByIds: jest.fn().mockReturnValue(mockTags),
  };

  const mockUserServices = {
    getUser: jest.fn().mockReturnValue(mockUserModel),
  };

  const mockRentsServices = {
    validateRentTransaction: jest.fn().mockReturnValue(true),
    makeRentTransaction: jest.fn().mockImplementation(() => Promise.resolve()),
    returnMovies: jest.fn().mockImplementation(() => Promise.resolve()),
    getUserRents: jest.fn().mockReturnValue([mockRentModel]),
  };

  const mockPurchasesServices = {
    makePurchase: jest.fn().mockImplementation(() => {
      Promise.resolve();
    }),
    getUserPurchases: jest.fn().mockReturnValue([mockPurchase]),
  };

  const mockMailerServices = {
    sendMail: jest.fn().mockReturnValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: getRepositoryToken(Movie), useValue: mockRepo },
        { provide: TagsService, useValue: mockTagsServices },
        { provide: UsersService, useValue: mockUserServices },
        { provide: RentsService, useValue: mockRentsServices },
        { provide: PurchasesService, useValue: mockPurchasesServices },
        { provide: MailerService, useValue: mockMailerServices },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When create a movie', () => {
    it('should create the movie', async () => {
      const movie = await service.createMovie(MoviesMock.mockAddMovie);

      expect(mockRepo.create).toBeCalledWith(MoviesMock.mockAddMovie);
      expect(mockRepo.save).toBeCalledTimes(1);
      expect(movie).toBe(MoviesMock.mockMovieModel);
    });
  });

  describe('When deleting an movie', () => {
    it('should delete a movie', async () => {
      const id = MoviesMock.mockMovieModel.id;
      const affected = await service.deleteMovie(id);

      expect(mockRepo.delete).toBeCalledWith(id);
      expect(affected).toBe(true);
    });

    it('Should trowh error when movie have not been deleted', async () => {
      mockRepo.delete = jest.fn().mockReturnValue({ affected: 0 });
      const nonExistentId = -1;
      try {
        await service.deleteMovie(nonExistentId);
      } catch (error) {
        expect(mockRepo.delete).toBeCalledWith(nonExistentId);
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Movie to delete not found');
      }
    });
  });

  describe('When updating a movie', () => {
    it('should update an movie', async () => {
      mockRepo.save = jest
        .fn()
        .mockReturnValue(MoviesMock.mockUpdatedMovieModel);
      const id = MoviesMock.mockMovieModel.id;
      const userUpdated = await service.updateMovie(
        id,
        MoviesMock.mockUpdateMovieParams,
      );

      expect(mockRepo.findOne).toBeCalledWith(id);
      expect(userUpdated).toBe(MoviesMock.mockUpdatedMovieModel);
    });

    it('should throw error when movie to update is not found', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(undefined);
      try {
        await service.updateMovie(1, MoviesMock.mockUpdateMovieParams);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('The movie to update is not found');
      }
    });
  });

  describe('When getting an movie by id', () => {
    it('should get a movie', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(MoviesMock.mockMovieModel);
      const id = MoviesMock.mockMovieModel.id;
      const movie = await service.getMovie(id);

      expect(mockRepo.findOne).toBeCalledWith(id, { relations: ['tags'] });
      expect(movie).toBe(MoviesMock.mockMovieModel);
    });

    it('should throw when movie is not found', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(undefined);
      const nonExistentId = -1;
      try {
        await service.getMovie(nonExistentId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Movie not found, id: ${nonExistentId}`);
      }
    });
  });

  describe('When getting movies', () => {
    it('should get movies when movies found and not tags filters passed', async () => {
      mockRepo.find = jest.fn().mockReturnValue(MoviesMock.mockMovies.movies);
      const movies = await service.getMovies({
        sortBy: undefined,
        title: undefined,
        tags: [],
        availability: undefined,
      });
      expect(movies).toBe(MoviesMock.mockMovies.movies);
    });

    it('should get movies when movies found and the tags filters passed are in movies', async () => {
      mockRepo.find = jest.fn().mockReturnValue(MoviesMock.mockMovies.movies);
      const tagInMovieModel = MoviesMock.mockMovies.movies[0].tags[0].tag;
      const movies = await service.getMovies({
        sortBy: undefined,
        title: undefined,
        tags: [tagInMovieModel],
        availability: undefined,
      });
      expect(movies).toStrictEqual(MoviesMock.mockMovies.movies);
    });

    it('should throw error when there are not any movies', async () => {
      mockRepo.find = jest.fn().mockReturnValue([]);
      try {
        await service.getMovies({
          sortBy: undefined,
          title: undefined,
          tags: [],
          availability: undefined,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Movies not found');
      }
    });

    it('should throw error when there are movies but tags filters params passed are not in the found movies', async () => {
      mockRepo.find = jest.fn().mockReturnValue(MoviesMock.mockMovies.movies);
      const nonExistingTagInMovieModel = 'lorem';
      try {
        await service.getMovies({
          sortBy: undefined,
          title: undefined,
          tags: [nonExistingTagInMovieModel],
          availability: undefined,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Movies not found');
      }
    });
  });

  describe('When assigning tags to movies', () => {
    it('should add tags to movie, by tags ids', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(MoviesMock.mockMovieModel);
      const id = MoviesMock.mockMovieModel.id;
      await service.assingTags(id, { tagsIds: [1, 2] });
    });
  });

  describe('When unassigning tags to movies', () => {
    it('should delete tags to movie, by tags ids', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(MoviesMock.mockMovieModel);
      const movieModelTagOneUnassigned = MoviesMock.mockMovieModel;
      movieModelTagOneUnassigned.tags.pop();
      const id = MoviesMock.mockMovieModel.id;
      await service.unassingTags(id, { tagsIds: [2] });
      expect(mockRepo.save).toBeCalledWith(movieModelTagOneUnassigned);
    });
  });

  describe('When renting  movies', () => {
    it('should rent movies', async () => {
      const movieId = MoviesMock.mockMovieModel.id;
      const userId = mockUserModel.id;

      await service.rentMovies({ moviesId: [movieId] }, userId);
    });

    it('should throw error when movie is not available', async () => {
      mockRepo.find = jest
        .fn()
        .mockReturnValue([MoviesMock.mockMovieModelNoAvailable]);

      const movieId = MoviesMock.mockMovieModel.id;
      const userId = mockUserModel.id;
      try {
        await service.rentMovies({ moviesId: [movieId] }, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(
          'Rent transaction cannot be proccessed, user already rente any movies in movies to rent list or some movies are not availables',
        );
      }
    });

    it('should throw error when movie has not stock', async () => {
      mockRepo.find = jest
        .fn()
        .mockReturnValue([MoviesMock.mockMovieModelNoStock]);

      const movieId = MoviesMock.mockMovieModel.id;
      const userId = mockUserModel.id;

      try {
        await service.rentMovies({ moviesId: [movieId] }, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(
          'Rent transaction cannot be proccessed, user already rente any movies in movies to rent list or some movies are not availables',
        );
      }
    });
  });

  describe('When returning a movie', () => {
    it('should return the movies', async () => {
      const movieId = MoviesMock.mockMovieModel.id;
      const userId = mockUserModel.id;

      await service.returnMovies({ moviesId: [movieId] }, userId);
    });
  });

  describe('When buying a movie', () => {
    it('should buy the movie', async () => {
      const movieId = MoviesMock.mockMovieModel.id;
      const userId = mockUserModel.id;

      await service.purchaseMovies(
        { movies: [{ movieId, quantity: 1 }] },
        userId,
      );
    });

    it('should throw error when movie is not available', async () => {
      mockRepo.find = jest
        .fn()
        .mockReturnValue([MoviesMock.mockMovieModelNoAvailable]);
      const movieId = MoviesMock.mockMovieModel.id;
      const userId = mockUserModel.id;
      try {
        await service.purchaseMovies(
          { movies: [{ movieId, quantity: 1 }] },
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(
          'Sorry, any movies have not enough stock or are not availables',
        );
      }
    });

    it('should throw error when movie has not stock', async () => {
      mockRepo.findOne = jest
        .fn()
        .mockReturnValue(MoviesMock.mockMovieModelNoStock);
      const movieId = MoviesMock.mockMovieModel.id;
      const userId = mockUserModel.id;

      try {
        await service.purchaseMovies(
          { movies: [{ movieId, quantity: 1 }] },
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(
          'Sorry, any movies have not enough stock or are not availables',
        );
      }
    });
  });

  describe('When getting an user purchases', () => {
    it('should get an user detail without user properties', async () => {
      const userId = mockUserModel.id;
      const purchases = await service.getUserPurchases(userId);

      const purchaseWithoutUser = mockPurchase;
      delete purchaseWithoutUser.user;

      expect(purchases).toStrictEqual([purchaseWithoutUser]);
    });
  });

  describe('When getting an user rents', () => {
    it('should get an user rents ', async () => {
      const userId = mockUserModel.id;
      const rents = await service.getUserRents(userId);

      const rentsWithoutUser = mockRentModel;
      delete rentsWithoutUser.user;

      expect(rents).toStrictEqual([rentsWithoutUser]);
    });
  });

  describe('When turning a sort query param to sort query', () => {
    it('should return the sort by ascending likes query', () => {
      const sortByQuery = service.getSortByParam(
        SortingOptionsEnum.LIKES_ASCENDING,
      );
      expect(sortByQuery).toStrictEqual({ likes: 'ASC' });
    });

    it('should return the sort by descending likes query', () => {
      const sortByQuery = service.getSortByParam(
        SortingOptionsEnum.LIKES_DESCENDING,
      );
      expect(sortByQuery).toStrictEqual({ likes: 'DESC' });
    });

    it('should return the sort by ascending title query ', () => {
      const sortByQuery = service.getSortByParam(
        SortingOptionsEnum.NAMES_ASCENDING,
      );
      expect(sortByQuery).toStrictEqual({ title: 'ASC' });
    });

    it('should return the sort by descending title query', () => {
      const sortByQuery = service.getSortByParam(
        SortingOptionsEnum.NAMES_DESCENDING,
      );
      expect(sortByQuery).toStrictEqual({ title: 'DESC' });
    });

    it('should return the default query no sort query param passed', () => {
      const sortByQuery = service.getSortByParam('');
      expect(sortByQuery).toStrictEqual({ title: 'DESC' });
    });
  });
});
