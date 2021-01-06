import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { classToPlain, plainToClass } from 'class-transformer';

import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserDoc } from '../../users/docs/user.doc';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Bad credentials, user not found');
    }
    const cleanUser = plainToClass(UserDoc, user, {
      excludeExtraneousValues: true,
    });
    return classToPlain(cleanUser);
  }
}
