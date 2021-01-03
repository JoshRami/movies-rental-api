import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from 'src/movies/movies.entity';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { Purchase } from './purchases.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,
  ) {}

  async insertPurchaseTransaction(userBuying: User, movieToBuy: Movie) {
    const purchaseTransaction = this.purchasesRepository.create({
      user: userBuying,
      movie: movieToBuy,
      purchasesPrice: movieToBuy.salePrice,
    });
    return await this.purchasesRepository.save(purchaseTransaction);
  }
}
