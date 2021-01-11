import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class RentMoviesDto {
  @ApiProperty({
    description: 'movies ids rent',
    type: 'integer',
    isArray: true,
  })
  @IsNumber({ allowNaN: false }, { each: true })
  @Transform((ids) => {
    return ids.map((id) => {
      return Number(id);
    });
  })
  moviesId: number[];
}
