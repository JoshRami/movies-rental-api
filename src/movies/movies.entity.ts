import { Tag } from '../tags/tags.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  poster?: string;

  @Column({ default: 1 })
  stock: number;

  @Column({ nullable: true })
  trailer?: string;

  @Column({ type: 'numeric', precision: 2 })
  salePrice: number;

  @Column({ default: 0 })
  likes?: number;

  @Column({ default: true })
  availability: boolean;

  @ManyToMany((type) => Tag, (tag) => tag.movies)
  @JoinTable({ name: 'movies_tags' })
  tags?: Tag[];
}
