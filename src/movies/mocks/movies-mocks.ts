import { Tag } from 'src/tags/tags.entity';
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
  rentPrice: 10,
};

export const mockMovieModel: Movie = {
  id: 1,
  ...mockAddMovie,
  tags: [
    { id: 1, tag: 'action', movies: undefined },
    { id: 2, tag: 'funny', movies: undefined },
  ],
};

export const mockMovieModelNoStock: Movie = {
  id: 1,
  title: 'The Guardians',
  description: 'The most panic movie since mickey mouse',
  stock: 0,
  trailer: 'https://localhost:5001/netflix/movies/1/watch',
  availability: true,
  salePrice: 50,
  rentPrice: 10,
  poster: 'https://localhost:5001/image.png',
  tags: [] as Tag[],
};

export const mockMovieModelNoAvailable: Movie = {
  id: 1,
  title: 'The Guardians',
  description: 'The most panic movie since mickey mouse',
  stock: 1,
  trailer: 'https://localhost:5001/netflix/movies/1/watch',
  availability: false,
  salePrice: 50,
  rentPrice: 10,
  poster: 'https://localhost:5001/image.png',
  tags: [] as Tag[],
};

export const mockUpdateMovieParams: UpdateMovieDto = {
  salePrice: 49,
};

export const mockUpdatedMovieModel: Movie = {
  id: 1,
  title: 'The Guardians',
  description: 'The most panic movie since mickey mouse',
  stock: 12,
  rentPrice: 10,
  trailer: 'https://localhost:5001/netflix/movies/1/watch',
  availability: true,
  salePrice: mockUpdateMovieParams.salePrice,
  poster: 'https://localhost:5001/image.png',
  tags: [] as Tag[],
};

export const mockMovies = { movies: [mockMovieModel] };
