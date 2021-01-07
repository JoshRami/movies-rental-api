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
  async getMovies() {
    const movies = await this.moviesService.getMovies();
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

  @Post(':id/buy')
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'The movie has been successfuly buyed.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'movie not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 409,
    description: 'The movie is not available or there is not stock',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad format input data, or the user have not rent this movie',
  })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async buyMovie(@Param('id', ParseIntPipe) movieId: number, @Req() req) {
    const userId = req.user.id;
    const purchase = await this.moviesService.purchaseMovie(movieId, userId);
    return {
      data: {
        id: purchase.id,
        purchaseDate: purchase.rentDate,
        movie: purchase.movie,
      },
      buyerUserId: purchase.user.id,
    };
  }
}
