import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import * as MoviesMock from './mocks/movies-mocks';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './movies.entity';

describe('MoviesService', () => {
  let service: MoviesService;

  const mockRepo = {
    create: jest.fn().mockReturnValue(MoviesMock.mockMovieModel),
    save: jest.fn().mockReturnValue(MoviesMock.mockMovieModel),
    delete: jest.fn().mockReturnValue({ affected: 1 }),
    findOne: jest.fn().mockReturnValue(MoviesMock.mockMovieModel),
    find: jest.fn().mockReturnValue(MoviesMock.mockMovies),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: getRepositoryToken(Movie), useValue: mockRepo },
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
      const userUpdated = await service.updateMovies(
        id,
        MoviesMock.mockUpdateMovieParams,
      );

      expect(mockRepo.findOne).toBeCalledWith(id);
      expect(userUpdated).toBe(MoviesMock.mockUpdatedMovieModel);
    });

    it('should throw error when movie to update is not found', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(undefined);
      try {
        await service.updateMovies(1, MoviesMock.mockUpdateMovieParams);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('The movie to update is not found');
      }
    });
  });

  describe('When getting an movie by id', () => {
    it('should get a movie', async () => {
      const id = MoviesMock.mockMovieModel.id;

      mockRepo.findOne = jest.fn().mockReturnValue(MoviesMock.mockMovieModel);
      const movie = await service.getMovie(id);

      expect(mockRepo.findOne).toBeCalledWith(id);
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
      const movies = await service.getMovies();
      expect(movies).toBe(MoviesMock.mockMovies);
    });

    it('should throw error when there are not any movies', async () => {
      mockRepo.find = jest.fn().mockReturnValue(undefined);
      try {
        await service.getMovies();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Movies not found');
      }
    });
  });
});
