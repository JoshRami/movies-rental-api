import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { Movie } from './movies.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsModule } from 'src/tags/tags.module';
import { RentsModule } from 'src/rents/rents.module';
import { UsersModule } from 'src/users/users.module';
import { PurchaseModule } from '../purchases/purchases.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie]),
    TagsModule,
    RentsModule,
    UsersModule,
    PurchaseModule,
  ],
  providers: [MoviesService],
  controllers: [MoviesController],
})
export class MoviesModule {}
