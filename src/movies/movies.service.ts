import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagsService } from '../tags/tags.service';

import { In, Like, Repository } from 'typeorm';
import { TagsToMovieDto } from './dto/tags-to-movie.dto';
import { CreateMovieDto } from './dto/create.movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './movies.entity';
import { UsersService } from '../users/users.service';
import { RentsService } from '../rents/rents.service';
import { PurchasesService } from '../purchases/purchases.service';
import { MailerService } from '@nestjs-modules/mailer';
import { MovieParamsDto } from './dto/query.params.movies.dto';
import { SortingOptionsEnum } from './enums/sorting.enum';
import { BuyMoviesDto } from './dto/buy-movies.dto';
import { MoviesToBuyDetails } from './interfaces/movies-to-buy.interface';
import { RentMoviesDto } from './dto/rent-movies.dto';

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

  async getMovies(query: MovieParamsDto): Promise<Movie[]> {
    const availability = query.availability ?? true;
    const title = query.title ?? '';
    const tagsFilters = query.tags ?? [];
    const sortBy = query.sortBy ?? '';

    const sortByQuery = this.getSortByParam(sortBy);

    const movies = await this.moviesRepository.find({
      relations: ['tags'],
      order: sortByQuery,
      where: { availability, title: Like(`%${title}%`) },
    });

    if (!movies.length) {
      throw new NotFoundException('Movies not found');
    }
    if (movies.length && !tagsFilters.length) {
      return movies;
    }

    const filterByTagsMovies = movies.filter((movie) => {
      const movieTags = movie.tags.map((tag) => tag.tag);
      return tagsFilters.every((tag) => {
        return movieTags.includes(tag);
      });
    });

    if (!filterByTagsMovies.length) {
      throw new NotFoundException('Movies not found');
    }
    return filterByTagsMovies;
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

  async rentMovies(rentMoviesDto: RentMoviesDto, userId: number) {
    const moviesId = rentMoviesDto.moviesId;
    const client = await this.usersService.getUser(userId);

    const movies = await this.moviesRepository.find({
      where: { id: In(moviesId) },
    });

    const canRentMovies = movies.every((movie) => {
      return movie.availability && movie.stock > 0;
    });

    const canUserRentMovies = await this.rentsService.validateRentTransaction(
      client,
      moviesId,
    );
    if (!canRentMovies || !canUserRentMovies) {
      throw new ConflictException(
        'Rent transaction cannot be proccessed, user already rente any movies in movies to rent list or some movies are not availables',
      );
    }
    const rent = await this.rentsService.makeRentTransaction(client, movies);

    await this.mailerService.sendMail({
      to: client.email,
      from: 'ia.josuequinteros@ufg.edu.sv',
      template: 'rent',
      subject: 'Rent Transaction summary - Movie Rental ✔',
      context: {
        email: client.email,
        movies: movies,
        total: rent.total,
        rentDate: rent.createdAt,
      },
    });
  }

  async returnMovies(rentMoviesDto: RentMoviesDto, userId: number) {
    const client = await this.usersService.getUser(userId);
    const moviesId = rentMoviesDto.moviesId;

    const moviesToUpdateStock = await this.rentsService.returnMovies(
      moviesId,
      client,
    );
    moviesToUpdateStock.forEach((movie) => {
      movie.stock += 1;
    });
    await this.moviesRepository.save(moviesToUpdateStock);
  }

  async purchaseMovies(buyMoviesDto: BuyMoviesDto, userId: number) {
    const moviesToBuy = buyMoviesDto.movies;
    const moviesIds = moviesToBuy.map((movie) => movie.movieId);

    const client = await this.usersService.getUser(userId);

    const movies = await this.moviesRepository.find({
      where: { id: In(moviesIds) },
    });

    const canBuyMovies = movies.every((movie) => {
      const movieToBuy = moviesToBuy.find(
        (movieToBuy) => movieToBuy.movieId === movie.id,
      );
      return movieToBuy.quantity <= movie.stock && movie.availability;
    });

    if (!canBuyMovies) {
      throw new ConflictException(
        'Sorry, any movies have not enough stock or are not availables',
      );
    }

    const moviesToBuyDetails: MoviesToBuyDetails[] = movies.map((movie) => {
      const movieToBuy = moviesToBuy.find(
        (movieToBuy) => movieToBuy.movieId === movie.id,
      );
      return { movieToBuy: movie, quantity: movieToBuy.quantity };
    });

    const purchase = await this.purchasesService.makePurchase(
      client,
      moviesToBuyDetails,
    );

    await this.mailerService.sendMail({
      to: client.email,
      from: 'ia.josuequinteros@ufg.edu.sv',
      template: 'purchase',
      subject: 'Purchase Transaction summary - Movie Rental ✔',
      context: {
        email: client.email,
        movies,
        total: purchase.total,
        purchaseDate: purchase.createdAt,
      },
    });
  }

  async getUserPurchases(userId: number) {
    const user = await this.usersService.getUser(userId);
    const purchases = await this.purchasesService.getUserPurchases(user);

    purchases.forEach((purchase) => {
      delete purchase.user;
    });

    return purchases;
  }

  async getUserRents(userId: number) {
    const user = await this.usersService.getUser(userId);
    const rents = await this.rentsService.getUserRents(user);

    rents.forEach((rent) => {
      delete rent.user;
    });

    return rents;
  }

  getSortByParam(sortBy: string) {
    let sortByQuery;
    switch (sortBy) {
      case SortingOptionsEnum.NAMES_ASCENDING:
        sortByQuery = { title: 'ASC' };
        break;
      case SortingOptionsEnum.NAMES_DESCENDING:
        sortByQuery = { title: 'DESC' };
        break;
      case SortingOptionsEnum.LIKES_ASCENDING:
        sortByQuery = { likes: 'ASC' };
        break;
      case SortingOptionsEnum.LIKES_DESCENDING:
        sortByQuery = { likes: 'DESC' };
        break;
      default:
        sortByQuery = { title: 'DESC' };
        break;
    }
    return sortByQuery;
  }
}
