import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoviesToBuyDetails } from 'src/movies/interfaces/movies-to-buy.interface';
import { User } from 'src/users/users.entity';
import { Connection, Repository } from 'typeorm';
import { PurchaseDetail } from './purchases.detail.entity';
import { Purchase } from './purchases.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,
    @InjectRepository(PurchaseDetail)
    private readonly purchasesDetailRepository: Repository<PurchaseDetail>,
    private connection: Connection,
  ) {}

  async makePurchase(
    userBuying: User,
    moviesToBuyDetails: MoviesToBuyDetails[],
  ) {
    const purchaseDetails: PurchaseDetail[] = moviesToBuyDetails.map(
      (movieToBuyDetail) => {
        const quantity = movieToBuyDetail.quantity;
        const subtotal = movieToBuyDetail.movieToBuy.salePrice * quantity;
        const purchaseDetail = this.purchasesDetailRepository.create({
          quantity,
          subtotal,
          movie: movieToBuyDetail.movieToBuy,
        });
        return purchaseDetail;
      },
    );

    const purchaseDetailsSubtotals = purchaseDetails.map((purchaseDetail) => {
      return purchaseDetail.subtotal;
    });

    const total = purchaseDetailsSubtotals.reduce(
      (totalAccumulator, currentSubtotal) => totalAccumulator + currentSubtotal,
    );
    const purchase = this.purchasesRepository.create({ total });
    purchase.purchaseDetails = purchaseDetails;
    purchase.user = userBuying;

    const moviesStockUpdated = moviesToBuyDetails.map((movieToBuyDetail) => {
      const movie = movieToBuyDetail.movieToBuy;
      movie.stock -= movieToBuyDetail.quantity;
      return movie;
    });

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(purchaseDetails);
      const purchaseEntity = await queryRunner.manager.save(purchase);
      await queryRunner.manager.save(moviesStockUpdated);

      await queryRunner.commitTransaction();

      return purchaseEntity;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserPurchases(user: User) {
    const purchases = await this.purchasesRepository.find({
      relations: ['user', 'purchaseDetails'],
      where: { user },
    });
    if (!purchases.length) {
      throw new NotFoundException(
        'Purchases not found: The user have not made any purchase yet',
      );
    }

    return purchases;
  }
}
