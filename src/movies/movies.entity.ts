import { Tag } from '../tags/tags.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rent } from '../rents/rents.entity';
import { PurchaseDetail } from '../purchases/purchases.detail.entity';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  poster: string;

  @Column({ default: 1 })
  stock: number;

  @Column({ nullable: true })
  trailer: string;

  @Column({ type: 'numeric', precision: 2 })
  salePrice: number;

  @Column({ type: 'numeric', precision: 2 })
  rentPrice: number;

  @Column({ default: 0 })
  likes?: number;

  @Column({ default: true })
  availability: boolean;

  @ManyToMany(() => Tag, (tag) => tag.movies)
  @JoinTable({ name: 'movies_tags' })
  tags?: Tag[];

  @OneToMany(() => Rent, (rent) => rent.movie)
  rents?: Rent[];

  @OneToMany(() => PurchaseDetail, (purchaseDetail) => purchaseDetail.movie)
  purchaseDetails?: PurchaseDetail[];
}
