import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from 'src/movies/movies.entity';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { Rent } from './rents.entity';

@Injectable()
export class RentsService {
  constructor(
    @InjectRepository(Rent)
    private readonly rentRepository: Repository<Rent>,
  ) {}

  async insertRentTransaction(userRenting: User, movieToRent: Movie) {
    const rentTransaction = await this.rentRepository.findOne({
      user: userRenting,
      movie: movieToRent,
    });
    if (rentTransaction) {
      throw new ConflictException('You have already rent this movie');
    }
    const newRentTransaction = this.rentRepository.create({
      user: userRenting,
      movie: movieToRent,
      rentPrice: movieToRent.salePrice,
    });
    return await this.rentRepository.save(newRentTransaction);
  }

  async deleteRentTransaction(rentId: number) {
    const NOT_AFFECTED = 0;
    const { affected } = await this.rentRepository.delete(rentId);
    if (NOT_AFFECTED === affected) {
      throw new ConflictException('The rent transaction appears to not exist');
    }
  }

  async getRentTransactionById(rentId: number) {
    const rentTransaction = await this.rentRepository.findOne(rentId);
    if (!rentTransaction) {
      throw new NotFoundException('The rent transaction does not exists');
    }
    return rentTransaction;
  }
}
