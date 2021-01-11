import { Tag } from '../tags/tags.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PurchaseDetail } from '../purchases/purchases.detail.entity';
import { RentDetail } from '../rents/rents.detail.entity';

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

  @OneToMany(() => RentDetail, (rentDetail) => rentDetail.movie)
  rentDetails?: RentDetail[];

  @OneToMany(() => PurchaseDetail, (purchaseDetail) => purchaseDetail.movie)
  purchaseDetails?: PurchaseDetail[];
}
