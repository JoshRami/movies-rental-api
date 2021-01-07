import { Movie } from '../movies/movies.entity';
import {
  Column,
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

  @Column()
  rentPrice: number;

  @ManyToOne(() => Movie, (movie) => movie.rents, { onDelete: 'CASCADE' })
  movie: Movie;

  @ManyToOne(() => User, (user) => user.rents, { onDelete: 'CASCADE' })
  user: User;
}
