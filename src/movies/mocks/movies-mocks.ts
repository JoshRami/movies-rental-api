import { CreateMovieDto } from '../dto/create.movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { Movie } from '../movies.entity';

export const mockAddMovie: CreateMovieDto = {
  title: 'The Guardians',
  description: 'The most panic movie since mickey mouse',
  stock: 12,
  trailer: 'https://localhost:5001/netflix/movies/1/watch',
  availability: true,
  salePrice: 50,
  poster: 'https://localhost:5001/image.png',
};

export const mockUpdateMovieParams: UpdateMovieDto = {
  salePrice: 49,
};

export const mockMovieModel: Movie = {
  id: 1,
  ...mockAddMovie,
};

export const mockUpdatedMovieModel: Movie = {
  id: 1,
  title: 'The Guardians',
  description: 'The most panic movie since mickey mouse',
  stock: 12,
  trailer: 'https://localhost:5001/netflix/movies/1/watch',
  availability: true,
  salePrice: mockUpdateMovieParams.salePrice,
  poster: 'https://localhost:5001/image.png',
};

export const mockMovies = { movies: [mockMovieModel] };
