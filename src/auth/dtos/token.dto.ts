import { Expose } from 'class-transformer';

export class TokenDto {
  @Expose()
  username: string;

  @Expose({ name: 'sub' })
  id: number;

  @Expose()
  role: string;
}
