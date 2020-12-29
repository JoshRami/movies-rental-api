import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create.movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './movies.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  async createMovie(movie: CreateMovieDto): Promise<Movie> {
    const newMovie = this.moviesRepository.create(movie);
    return await this.moviesRepository.save(newMovie);
  }

  async deleteMovie(id: number): Promise<boolean> {
    const IS_AFFECTED = 1;
    const { affected } = await this.moviesRepository.delete(id);
    if (!affected) {
      throw new BadRequestException('Movie to delete not found');
    }
    return affected === IS_AFFECTED;
  }

  async updateMovies(
    id: number,
    updateUserDto: UpdateMovieDto,
  ): Promise<Movie> {
    const movie = await this.moviesRepository.findOne(id);

    if (!movie) {
      throw new NotFoundException('The movie to update is not found');
    }
    const updated = await this.moviesRepository.save({
      ...movie,
      ...updateUserDto,
    });

    return updated;
  }

  async getMovie(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOne(id);
    if (!movie) {
      throw new NotFoundException(`Movie not found, id: ${id}`);
    }
    return movie;
  }

  async getMovies(): Promise<Movie[]> {
    const movies = await this.moviesRepository.find({ order: { title: -1 } });
    if (!movies) {
      throw new NotFoundException('Movies not found');
    }
    return movies;
  }
}
