import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { SortingOptionsEnum } from '../enums/sorting.enum';

export class MovieParamsDto {
  @ApiProperty({
    description: 'sorting movies options',
    enum: SortingOptionsEnum,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(SortingOptionsEnum))
  sortBy: string;

  @ApiProperty({
    description: 'filter by availability',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform((val) => {
    switch (val) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        return val;
    }
  })
  availability: boolean;

  @ApiProperty({
    description: 'filter by movies title',
    required: false,
  })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'filter by tags name',
    required: false,
  })
  @Transform((val) => {
    return Array.isArray(val) ? val : [val];
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
