import { Movie } from '../movies/movies.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Purchase } from './purchases.entity';

@Entity()
export class PurchaseDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ type: 'numeric', precision: 2 })
  subtotal: number;

  @ManyToOne(() => Movie, (movie) => movie.rents, { onDelete: 'CASCADE' })
  movie: Movie;

  @ManyToOne(() => Purchase, (purchase) => purchase.purchaseDetails)
  purchase: Purchase;
}
