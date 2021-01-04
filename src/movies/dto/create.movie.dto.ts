import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ description: 'most be unique' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsUrl()
  poster: string;

  @ApiProperty()
  @IsNumber()
  stock: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsUrl()
  trailer: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  salePrice: number;

  @ApiProperty()
  @IsBoolean()
  availability: boolean;
}
