import { Movie } from '../movies/movies.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tag: string;

  @ManyToMany(() => Movie, (movie) => movie.tags)
  movies: Movie[];
}
