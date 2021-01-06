import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenDoc {
  @Expose({ name: 'id' })
  @ApiProperty()
  sub: number;
}
