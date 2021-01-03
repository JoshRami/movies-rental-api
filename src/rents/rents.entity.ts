import { Movie } from '../movies/movies.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class Rent {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'rentDate',
  })
  rentDate: Date;

  @ManyToOne(() => Movie, (movie) => movie.rents)
  movie: Movie;

  @ManyToOne(() => User, (user) => user.rents)
  user: User;
}
