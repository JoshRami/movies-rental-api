import { Expose } from 'class-transformer';

export class UserDoc {
  @Expose()
  email: string;

  @Expose()
  id: number;
}
