import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagsService } from '../tags/tags.service';

import { Repository } from 'typeorm';
import { TagsToMovieDto } from './dto/tags-to-movie.dto';
import { CreateMovieDto } from './dto/create.movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './movies.entity';
import { UsersService } from '../users/users.service';
import { RentsService } from '../rents/rents.service';
import { PurchasesService } from '../purchases/purchases.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService,
    private readonly rentsService: RentsService,
    private readonly purchasesService: PurchasesService,
    private readonly mailerService: MailerService,
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

  async updateMovie(id: number, updateUserDto: UpdateMovieDto): Promise<Movie> {
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
    const movie = await this.moviesRepository.findOne(id, {
      relations: ['tags'],
    });
    if (!movie) {
      throw new NotFoundException(`Movie not found, id: ${id}`);
    }
    return movie;
  }

  async getMovies(): Promise<Movie[]> {
    const movies = await this.moviesRepository.find({ order: { title: 1 } });
    if (!movies.length) {
      throw new NotFoundException('Movies not found');
    }
    return movies;
  }

  async assingTags(id: number, addTagsToMovieDto: TagsToMovieDto) {
    const movie = await this.moviesRepository.findOne(id, {
      relations: ['tags'],
    });
    const tagsIds = addTagsToMovieDto.tagsIds;
    const tags = await this.tagsService.getTagsByIds(tagsIds);

    movie.tags.push(...tags);
    await this.moviesRepository.save(movie);
  }

  async unassingTags(id: number, addTagsToMovieDto: TagsToMovieDto) {
    const movie = await this.moviesRepository.findOne(id, {
      relations: ['tags'],
    });
    const tagsIds = addTagsToMovieDto.tagsIds;

    movie.tags = movie.tags.filter((tag) => {
      return !tagsIds.includes(tag.id);
    });

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
    await this.mailerService.sendMail({
      to: user.email,
      from: 'ia.josuequinteros@ufg.edu.sv',
      template: 'transaction',
      subject: 'Transaction summary - Movie Rental ✔',
      context: {
        email: user.email,
        movie,
        transactionType: 'Rental',
        rentDate: transaction.rentDate,
      },
    });
    return transaction;
  }

  async returnMovie(rentId: number, userId: number) {
    const rentTransaction = await this.rentsService.getRentTransactionById(
      rentId,
    );
    if (userId !== rentTransaction.user.id) {
      throw new BadRequestException(
        'The user is not the owner of the rent transaction',
      );
    }
    await this.rentsService.deleteRentTransaction(rentId);

    const movie = await this.moviesRepository.findOne(rentTransaction.movie.id);
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
    await this.mailerService.sendMail({
      to: user.email,
      from: 'ia.josuequinteros@ufg.edu.sv',
      template: 'transaction',
      subject: 'Transaction summary - Movie Rental ✔',
      context: {
        email: user.email,
        movie,
        transactionType: 'Purchase',
        rentDate: purchase.rentDate,
      },
    });

    return purchase;
  }
}
