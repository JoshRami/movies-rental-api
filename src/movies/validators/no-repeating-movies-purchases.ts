import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class UniqueIdInMoviesConstrainsts
  implements ValidatorConstraintInterface {
  async validate(buyMoviesDetails: any): Promise<boolean> {
    const moviesIds = buyMoviesDetails.map((movie) => movie.movieId);
    return !moviesIds.some((val, i) => moviesIds.indexOf(val) !== i);
  }
}

export function IsUniqueIdInMovies(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueIdInMoviesConstrainsts,
    });
  };
}
