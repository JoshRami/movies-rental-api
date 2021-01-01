import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddTagsToMovieDto {
  @ApiProperty({ description: 'tags ids to assign to any movie' })
  @IsNumber({ allowNaN: false }, { each: true })
  tagsIds: number[];
}
