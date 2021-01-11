import { Movie } from '../movies.entity';

export interface MoviesToBuyDetails {
  movieToBuy: Movie;
  quantity: number;
}
