import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WhitelistGuard } from 'src/auth/guards/jwt-whitelist.guard';
import { AdminsGuard } from 'src/auth/guards/roles-autho-guards';
import { TagsToMovieDto } from './dto/tags-to-movie.dto';
import { CreateMovieDto } from './dto/create.movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoviesService } from './movies.service';
import { MovieParamsDto } from './dto/query.params.movies.dto';
import { BuyMoviesDto } from './dto/buy-movies.dto';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, WhitelistGuard, AdminsGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The movie has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'You have  submitted wrong data' })
  @ApiResponse({
    status: 422,
    description:
      'Error while interacting with the database, hint: please check you are not trying to submit data fields wich are uniques',
  })
  async createMovie(@Body() createUserDto: CreateMovieDto) {
    const movie = await this.moviesService.createMovie(createUserDto);
    return { data: movie };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, WhitelistGuard, AdminsGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiResponse({
    status: 204,
    description: 'The movie has been successfully deleted.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Movie to delete not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async deleteMovie(@Param('id', ParseIntPipe) id: number) {
    await this.moviesService.deleteMovie(id);
  }

  @Patch(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, WhitelistGuard, AdminsGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The movie has been successfully updated.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'movie to update not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'You have  submitted wrong data' })
  @ApiResponse({
    status: 422,
    description:
      'Error while interacting with the database, hint: please check you are not trying to submit data fields wich are uniques',
  })
  async updateMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateMovieDto,
  ) {
    const updatedMovie = await this.moviesService.updateMovie(
      id,
      updateUserDto,
    );
    return { data: updatedMovie };
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'The movies has been successfully return it.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'movie not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'You have  submitted wrong data' })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async getMovies(@Query() query: MovieParamsDto) {
    const movies = await this.moviesService.getMovies(query);
    return { data: movies };
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The movie has been successfully return it.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'movie not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'You have  submitted wrong data' })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async getMovie(@Param('id', ParseIntPipe) id: number) {
    const movie = await this.moviesService.getMovie(id);
    return { data: movie };
  }

  @Post(':id/tags')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WhitelistGuard, AdminsGuard)
  @ApiResponse({
    status: 204,
    description: 'The tags has been successfully attached to the movie.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'movie not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'You have  submitted wrong data' })
  @ApiResponse({
    status: 422,
    description:
      'Error while interacting with the database, hint: please check you are not trying to submit data fields wich are uniques',
  })
  async attachTagsToMovie(
    @Param('id', ParseIntPipe) movieId: number,
    @Body() tagsToMovieDto: TagsToMovieDto,
  ) {
    await this.moviesService.assingTags(movieId, tagsToMovieDto);
  }

  @Delete(':id/tags')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WhitelistGuard, AdminsGuard)
  @ApiResponse({
    status: 204,
    description: 'The tags has been successfully deleted to the movie.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'You have  submitted wrong data' })
  @ApiResponse({
    status: 422,
    description:
      'Error while interacting with the database, hint: please check you are not trying to submit data fields wich are uniques',
  })
  async detachTagsToMovie(
    @Param('id', ParseIntPipe) movieId: number,
    @Body() tagsToMovieDto: TagsToMovieDto,
  ) {
    await this.moviesService.unassingTags(movieId, tagsToMovieDto);
  }

  @Post(':id/rent')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The rent of the movies has been successful.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'movie not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 409,
    description:
      'The movie cannot be rent due to not availability or there is not stock',
  })
  @ApiResponse({ status: 400, description: 'You have  submitted wrong data' })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async rentMovie(@Param('id', ParseIntPipe) movieId: number, @Req() req) {
    const userId = req.user.id;
    const transaction = await this.moviesService.rentMovie(movieId, userId);
    return {
      data: {
        id: transaction.id,
        rentDate: transaction.rentDate,
        movie: transaction.movie,
      },
      rentByUser: transaction.user.id,
    };
  }

  @Post('rent/:id/return')
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiResponse({
    status: 204,
    description: 'The movie has been successfuly return it.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'movie not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 400,
    description:
      'You have submitted wrong data, or trying to return a movie wich is not rented by the user',
  })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async returnRentedMovie(
    @Param('id', ParseIntPipe) rentId: number,
    @Req() req,
  ) {
    const userId = req.user.id;
    await this.moviesService.returnMovie(rentId, userId);
  }

  @Post('/me/buy')
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiResponse({
    status: 204,
    description: 'The movies has been successfuly buyed.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'movie not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 409,
    description: 'The movies are not available or there is not stock',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad format input data',
  })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async buyMovies(@Body() buyMoviesDto: BuyMoviesDto, @Req() req) {
    const userId = req.user.id;
    await this.moviesService.purchaseMovies(buyMoviesDto, userId);
  }

  @Get('/me/buy')
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'The movies has been successfully return it.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({
    status: 404,
    description: 'The user have not made any purchase yet',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async getBuyedUserMovies(@Req() req) {
    const userId = req.user.id;
    const purchases = await this.moviesService.getUserPurchases(userId);

    return { data: { userOwnerId: userId, purchases } };
  }
}
