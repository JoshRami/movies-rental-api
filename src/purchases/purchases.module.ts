import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './purchases.entity';
import { PurchasesService } from './purchases.service';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase])],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchaseModule {}
