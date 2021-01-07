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
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'purchaseDate',
  })
  rentDate: Date;

  @Column({ type: 'numeric', precision: 2 })
  purchasesPrice: number;

  @ManyToOne(() => Movie, (movie) => movie.rents, { onDelete: 'CASCADE' })
  movie: Movie;

  @ManyToOne(() => User, (user) => user.rents, { onDelete: 'CASCADE' })
  user: User;
}
