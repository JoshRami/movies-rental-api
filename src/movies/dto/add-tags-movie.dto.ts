import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class AddTagsToMovieDto {
  @ApiProperty({
    description: 'tags ids to assign to any movie',
    type: 'integer',
    isArray: true,
  })
  @IsNumber({ allowNaN: false }, { each: true })
  @Transform((ids) => {
    return ids.map((id) => {
      return Number(id);
    });
  })
  tagsIds: number[];
}
