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
import { AddTagsToMovieDto } from './dto/add-tags-movie.dto';
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
  @ApiResponse({ status: 400, description: 'Movie to delete not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteMovie(@Param('id', ParseIntPipe) id: number) {
    await this.moviesService.deleteMovie(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, WhitelistGuard, AdminsGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The movie has been successfully updated.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 400, description: 'movie to update not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateMovieDto,
  ) {
    const updatedMovie = await this.moviesService.updateMovies(
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
  async getMovies() {
    const movies = await this.moviesService.getMovies();
    return { data: movies };
  }

  @Get(':id')
  @ApiResponse({
    status: 201,
    description: 'The movie has been successfully return it.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'movie not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMovie(@Param('id', ParseIntPipe) id: number) {
    const movie = await this.moviesService.getMovie(id);
    return { data: movie };
  }

  @Post(':id/tags')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WhitelistGuard, AdminsGuard)
  @ApiResponse({
    status: 204,
    description: 'The tags has been successfully attached to the movie.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'movie not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async attachTagsToMovie(
    @Param('id', ParseIntPipe) movieId: number,
    @Body() addTagsToMovieDto: AddTagsToMovieDto,
  ) {
    await this.moviesService.assingTags(movieId, addTagsToMovieDto);
  }

  @Post(':id/rent')
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiBearerAuth()
  @HttpCode(200)
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
  async rentMovie(@Param('id', ParseIntPipe) movieId: number, @Req() req) {
    const userId = req.user.id;
    await this.moviesService.rentMovie(movieId, userId);
  }

  @Post(':id/rent/return')
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'The movie has been successfuly return it.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'movie not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 400,
    description: 'The user have not rent this movie',
  })
  async returnRentedMovie(
    @Param('id', ParseIntPipe) movieId: number,
    @Req() req,
  ) {
    const userId = req.user.id;
    await this.moviesService.returnMovie(movieId, userId);
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
    description: 'The user have not rent this movie',
  })
  async buyMovie(@Param('id', ParseIntPipe) movieId: number, @Req() req) {
    const userId = req.user.id;
    await this.moviesService.purchaseMovie(movieId, userId);
  }
}
