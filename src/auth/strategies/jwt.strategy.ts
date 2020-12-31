import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenDto } from '../dtos/token.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWTSECRET,
    });
  }

  async validate(payload: any) {
    const user = plainToClass(TokenDto, payload, {
      excludeExtraneousValues: true,
    });
    const { username, id, role } = user;

    return { username, id, role };
  }
}
