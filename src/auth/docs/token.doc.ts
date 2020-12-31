import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenDoc {
  @Expose()
  @ApiProperty()
  username: string;

  @Expose({ name: 'id' })
  @ApiProperty()
  sub: number;
}
