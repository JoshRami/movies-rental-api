import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rent } from './rents.entity';
import { RentsService } from './rents.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rent])],
  providers: [RentsService],
  exports: [RentsService],
})
export class RentsModule {}
