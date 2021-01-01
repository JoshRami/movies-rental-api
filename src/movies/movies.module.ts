import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { Movie } from './movies.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsModule } from 'src/tags/tags.module';

@Module({
  imports: [TypeOrmModule.forFeature([Movie]), TagsModule],
  providers: [MoviesService],
  controllers: [MoviesController],
})
export class MoviesModule {}
