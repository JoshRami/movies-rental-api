import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentDetail } from './rents.detail.entity';
import { Rent } from './rents.entity';
import { RentsService } from './rents.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rent, RentDetail])],
  providers: [RentsService],
  exports: [RentsService],
})
export class RentsModule {}
