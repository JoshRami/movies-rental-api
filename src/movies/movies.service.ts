import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagsService } from '../tags/tags.service';

import { Repository } from 'typeorm';
import { AddTagsToMovieDto } from './dto/add-tags-movie.dto';
import { CreateMovieDto } from './dto/create.movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './movies.entity';
import { UsersService } from '../users/users.service';
import { RentsService } from '../rents/rents.service';
import { PurchasesService } from '../purchases/purchases.service';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService,
    private readonly rentsService: RentsService,
    private readonly purchasesService: PurchasesService,
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
    const movies = await this.moviesRepository.find({ order: { title: 1 } });
    if (!movies) {
      throw new NotFoundException('Movies not found');
    }
    return movies;
  }

  async assingTags(id: number, addTagsToMovieDto: AddTagsToMovieDto) {
    const movie = await this.moviesRepository.findOne(id, {
      relations: ['tags'],
    });
    const tagsIds = addTagsToMovieDto.tagsIds;
    const tags = await this.tagsService.getTagsByIds(tagsIds);

    movie.tags.push(...tags);
    await this.moviesRepository.save(movie);
  }

  async rentMovie(movieId: number, userId: number) {
    const movie = await this.moviesRepository.findOne(movieId);
    const user = await this.usersService.getUser(userId);
    if (!movie.stock || !movie.availability) {
      throw new ConflictException(
        'The movie is not available or there are not stock',
      );
    }
    const transaction = await this.rentsService.insertRentTransaction(
      user,
      movie,
    );
    movie.stock -= 1;
    await this.moviesRepository.save(movie);

    return transaction;
  }

  async returnMovie(movieId: number, userId: number) {
    const movie = await this.moviesRepository.findOne(movieId);
    const user = await this.usersService.getUser(userId);
    await this.rentsService.deleteRentTransaction(user, movie);
    movie.stock += 1;

    return await this.moviesRepository.save(movie);
  }

  async purchaseMovie(movieId: number, userId: number) {
    const movie = await this.moviesRepository.findOne(movieId);
    const user = await this.usersService.getUser(userId);
    if (!movie.stock || !movie.availability) {
      throw new ConflictException(
        'The movie is not available or there are not stock',
      );
    }
    const purchase = await this.purchasesService.insertPurchaseTransaction(
      user,
      movie,
    );
    movie.stock -= 1;
    await this.moviesRepository.save(movie);

    return purchase;
  }
}
