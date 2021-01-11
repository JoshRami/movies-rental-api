import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as rentMocks from './mocks/rents.mocks';
import { mockUserModel } from '../users/mocks/user-mocks';
import {
  mockRentDetail,
  mockRentDetailModel,
} from './mocks/rents.mocks.detail';
import { Connection } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RentsService } from './rents.service';
import { Rent } from './rents.entity';
import { RentDetail } from './rents.detail.entity';
import { mockMovieModel } from '../movies/mocks/movies-mocks';

describe('RentsService', () => {
  let service: RentsService;

  const mockRentRepo = {
    create: jest.fn().mockReturnValue(rentMocks.mockRent),
    find: jest.fn().mockReturnValue([rentMocks.mockRentModel]),
  };

  const mockRentDetailRepo = {
    create: jest.fn().mockReturnValue(mockRentDetail),
    find: jest.fn().mockReturnValue([mockRentDetailModel]),
    save: jest.fn(),
  };

  const mockConnection = {
    createQueryRunner: jest.fn().mockReturnValue({
      queryRunner: jest.fn().mockImplementation(() => {
        return {
          connect: jest.fn(),
          startTransaction: jest.fn(),
          manager: jest.fn().mockReturnValue({
            save: jest.fn().mockReturnValue(1),
          }),
          commitTransaction: jest.fn(),
          rollbackTransaction: jest.fn(),
          release: jest.fn(),
        };
      }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentsService,
        { provide: getRepositoryToken(Rent), useValue: mockRentRepo },
        {
          provide: getRepositoryToken(RentDetail),
          useValue: mockRentDetailRepo,
        },
        {
          provide: Connection,
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<RentsService>(RentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('While getting rents transactions', () => {
    it('should return an users rents', async () => {
      const user = mockUserModel;
      const rents = await service.getUserRents(user);
      expect(rents).toStrictEqual([rentMocks.mockRentModel]);
    });

    it('should throw error when user dont have purchases', async () => {
      mockRentRepo.find = jest.fn().mockReturnValue([]);
      const user = mockUserModel;
      try {
        await service.getUserRents(user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          'Rents not found: The user have not made any rents yet',
        );
      }
    });
  });

  describe('While validating rent transactions', () => {
    it('should return true when user have already rented a movie but this movies are already return it', async () => {
      const user = mockUserModel;
      const moviesId = [mockMovieModel.id];

      const isValidRentTransacction = await service.validateRentTransaction(
        user,
        moviesId,
      );
      expect(isValidRentTransacction).toBe(true);
    });

    it('should return false when user have already rented a movie but this movies is not return it', async () => {
      const notReturedRentDetailModel = mockRentDetailModel;
      notReturedRentDetailModel.returnIt = false;

      mockRentDetailRepo.find = jest
        .fn()
        .mockReturnValue([notReturedRentDetailModel]);

      const user = mockUserModel;
      const moviesId = [mockMovieModel.id];

      const isValidRentTransacction = await service.validateRentTransaction(
        user,
        moviesId,
      );
      expect(isValidRentTransacction).toBe(false);
    });
  });

  describe('While returning movies', () => {
    it('should save a rent transaction settign return it prop to true', async () => {
      const user = mockUserModel;
      const moviesId = [mockMovieModel.id];

      const notReturedRentDetailModel = mockRentDetailModel;
      notReturedRentDetailModel.returnIt = false;

      mockRentDetailRepo.find = jest
        .fn()
        .mockReturnValue([notReturedRentDetailModel]);

      await service.returnMovies(moviesId, user);
      expect(mockRentDetailRepo.save).toBeCalledWith([mockRentDetailModel]);
    });
  });
});
