import { Expose } from 'class-transformer';

export class UserDoc {
  @Expose()
  username: string;

  @Expose()
  id: number;
}
