import { Expose } from 'class-transformer';

export class TokenDto {
  @Expose({ name: 'sub' })
  id: number;
}
