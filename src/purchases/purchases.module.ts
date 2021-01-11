import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseDetail } from './purchases.detail.entity';
import { Purchase } from './purchases.entity';
import { PurchasesService } from './purchases.service';
@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseDetail])],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchaseModule {}
