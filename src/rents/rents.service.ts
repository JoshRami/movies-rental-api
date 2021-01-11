import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from 'src/movies/movies.entity';
import { User } from 'src/users/users.entity';
import { Connection, In, Repository } from 'typeorm';
import { RentDetail } from './rents.detail.entity';
import { Rent } from './rents.entity';

@Injectable()
export class RentsService {
  constructor(
    @InjectRepository(Rent)
    private readonly rentRepository: Repository<Rent>,
    @InjectRepository(RentDetail)
    private readonly rentDetailRepository: Repository<RentDetail>,
    private connection: Connection,
  ) {}

  async makeRentTransaction(userBuying: User, moviesToRent: Movie[]) {
    const rentDetails = moviesToRent.map((movieToRent) => {
      const subtotal = movieToRent.rentPrice;
      const rentDetail = this.rentDetailRepository.create({
        subtotal,
        movie: movieToRent,
      });
      return rentDetail;
    });

    const rentDetailsSubtotals = rentDetails.map((rentDetail) => {
      return rentDetail.subtotal;
    });

    const total = rentDetailsSubtotals.reduce(
      (totalAccumulator, currentSubtotal) =>
        +totalAccumulator + +currentSubtotal,
    );

    const rentPurchase = this.rentRepository.create({ total });
    rentPurchase.rentDetails = rentDetails;
    rentPurchase.user = userBuying;

    const moviesStockUpdated = moviesToRent.map((movieToRent) => {
      movieToRent.stock -= 1;
      return movieToRent;
    });

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(rentDetails);
      const rent = await queryRunner.manager.save(rentPurchase);
      await queryRunner.manager.save(moviesStockUpdated);

      await queryRunner.commitTransaction();

      return rent;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserRents(user: User) {
    const rents = await this.rentRepository.find({
      relations: ['user', 'rentDetails'],
      where: { user },
    });
    if (!rents.length) {
      throw new NotFoundException(
        'Rents not found: The user have not made any rents yet',
      );
    }

    return rents;
  }

  async validateRentTransaction(user: User, moviesId: number[]) {
    let isValidRentTransacction = true;
    const rents = await this.rentRepository.find({
      relations: ['user', 'rentDetails'],
      where: { user },
    });

    const rentDetails: RentDetail[] = [];
    rents.forEach((rent) => {
      rentDetails.push(...rent.rentDetails);
    });

    const rentsDetailIds = rentDetails.map((rentDetail) => rentDetail.id);

    const rentsDetailsEntities = await this.rentDetailRepository.find({
      relations: ['movie'],
      where: { id: In(rentsDetailIds) },
    });

    rentsDetailsEntities.forEach((rentDetail) => {
      const rentDetailFound = moviesId.some(
        (movieId) => rentDetail.movie.id === movieId,
      );
      if (rentDetailFound && !rentDetail.returnIt) {
        isValidRentTransacction = false;
      }
    });

    return isValidRentTransacction;
  }

  async returnMovies(moviesIds: number[], user: User) {
    const rents = await this.rentRepository.find({
      relations: ['user', 'rentDetails'],
      where: { user },
    });

    const rentDetails: RentDetail[] = [];
    rents.forEach((rent) => {
      rentDetails.push(...rent.rentDetails);
    });
    const rentsDetailIds = rentDetails.map((rentDetail) => rentDetail.id);

    const rentsDetailsEntities = await this.rentDetailRepository.find({
      relations: ['movie'],
      where: { id: In(rentsDetailIds) },
    });

    const moviesToUpdateStock: Movie[] = [];
    rentsDetailsEntities.forEach((rentDetail) => {
      const rentDetailFound = moviesIds.some(
        (movieId) => rentDetail.movie.id === movieId,
      );
      if (rentDetailFound && !rentDetail.returnIt) {
        moviesToUpdateStock.push(rentDetail.movie);
        rentDetail.returnIt = true;
      }
    });

    await this.rentDetailRepository.save(rentsDetailsEntities);
    return moviesToUpdateStock;
  }
}
