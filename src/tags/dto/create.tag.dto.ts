import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'most be unique' })
  @IsNotEmpty()
  @IsString()
  tag: string;
}
