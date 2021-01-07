import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { MoviesService } from './movies.service';
import * as MoviesMock from './mocks/movies-mocks';
import * as PurchasesMock from '../purchases/mocks/purchases.mocks';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './movies.entity';
import { TagsService } from '../tags/tags.service';
import { mockTags } from './mocks/tags.mocks';
import { UsersService } from '../users/users.service';
import { RentsService } from '../rents/rents.service';
import { PurchasesService } from '../purchases/purchases.service';
import { mockUserModel } from '../users/mocks/user-mocks';
import { mockRentTransactionModel } from '../rents/mocks/rents.mocks';
import { MailerService } from '@nestjs-modules/mailer';

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
    insertRentTransaction: jest.fn().mockReturnValue(mockRentTransactionModel),
    deleteRentTransaction: jest.fn().mockReturnValue({ affected: 1 }),
    getRentTransactionById: jest.fn().mockReturnValue(mockRentTransactionModel),
  };
  const mockPurchasesServices = {
    insertPurchaseTransaction: jest
      .fn()
      .mockReturnValue(PurchasesMock.mockPurchaseModel),
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
    it('should get movies', async () => {
      mockRepo.find = jest.fn().mockReturnValue(MoviesMock.mockMovies.movies);
      const movies = await service.getMovies();
      expect(movies).toBe(MoviesMock.mockMovies.movies);
    });

    it('should throw error when there are not any movies', async () => {
      mockRepo.find = jest.fn().mockReturnValue([]);
      try {
        await service.getMovies();
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

  describe('When renting a movie', () => {
    it('should rent a movie', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(MoviesMock.mockMovieModel);
      const movieId = MoviesMock.mockMovieModel.id;
      const userId = mockUserModel.id;

      const transaction = await service.rentMovie(movieId, userId);
      expect(transaction).toBe(mockRentTransactionModel);
    });

    it('should throw error when movie is not available', async () => {
      mockRepo.findOne = jest
        .fn()
        .mockReturnValue(MoviesMock.mockMovieModelNoAvailable);
      const movieId = MoviesMock.mockMovieModel.id;
      const userId = mockUserModel.id;
      try {
        await service.rentMovie(movieId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(
          'The movie is not available or there are not stock',
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
        await service.rentMovie(movieId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(
          'The movie is not available or there are not stock',
        );
      }
    });
  });

  describe('When returning a movie', () => {
    it('should return the movie updating the movie stock by one ', async () => {
      const movieId = MoviesMock.mockMovieModel.id;
      const userId = mockUserModel.id;

      const movie = await service.returnMovie(movieId, userId);
      expect(movie.stock).toBe(MoviesMock.mockMovieModel.stock + 1);
    });

    it('should throw error when the user returning the movie is not the owner of the transaction ', async () => {
      const movieId = MoviesMock.mockMovieModel.id;
      const noOwnerUserId = 1e5;

      try {
        await service.returnMovie(movieId, noOwnerUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(
          'The user is not the owner of the rent transaction',
        );
      }
    });
  });

  describe('When buying a movie', () => {
    it('should buy the movie', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(MoviesMock.mockMovieModel);
      const movieId = MoviesMock.mockMovieModel.id;
      const userId = mockUserModel.id;

      const transaction = await service.purchaseMovie(movieId, userId);
      expect(transaction).toBe(PurchasesMock.mockPurchaseModel);
    });

    it('should throw error when movie is not available', async () => {
      mockRepo.findOne = jest
        .fn()
        .mockReturnValue(MoviesMock.mockMovieModelNoAvailable);
      const movieId = MoviesMock.mockMovieModel.id;
      const userId = mockUserModel.id;
      try {
        await service.purchaseMovie(movieId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(
          'The movie is not available or there are not stock',
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
        await service.purchaseMovie(movieId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(
          'The movie is not available or there are not stock',
        );
      }
    });
  });
});
