import { Movie } from '../movies/movies.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Rent } from './rents.entity';

@Entity()
export class RentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 2 })
  subtotal: number;

  @Column({ default: false })
  returnIt: boolean;

  @ManyToOne(() => Movie, (movie) => movie.rentDetails, {
    onDelete: 'CASCADE',
  })
  movie: Movie;

  @ManyToOne(() => Rent, (rent) => rent.rentDetails)
  rent: Rent;
}
