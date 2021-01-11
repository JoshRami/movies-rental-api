import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { IsUniqueIdInMovies } from '../validators/no-repeating-movies-purchases';

class BuyMovieDto {
  @ApiProperty({ description: 'the movie id to buy' })
  @IsNumber()
  movieId: number;

  @ApiProperty({ description: 'the movie quantity' })
  @IsNumber()
  quantity: number;
}

export class BuyMoviesDto {
  @ApiProperty({
    description: 'the movies to buy, please check the BuyMovieDto',
  })
  @ValidateNested({ each: true })
  @Type(() => BuyMovieDto)
  @ArrayNotEmpty()
  @IsUniqueIdInMovies({
    message: 'The movies to buy objects should have different movies ids',
  })
  movies: BuyMovieDto[];
}
