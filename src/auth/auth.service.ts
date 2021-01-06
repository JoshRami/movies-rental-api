import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from '../tokens/tokens.service';
import { TokenDoc } from './docs/token.doc';
import { User } from '../users/users.entity';
import { plainToClass } from 'class-transformer';
import { UserDoc } from '../users/docs/user.doc';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokensService: TokensService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const foundUser = await this.usersService.findByCredentials(
      email,
      password,
    );
    return foundUser;
  }

  async login(user: UserDoc): Promise<string> {
    const tokenData = plainToClass(TokenDoc, user, {
      excludeExtraneousValues: true,
    });
    const { sub } = tokenData;

    const accessToken = this.jwtService.sign(
      { sub },
      { secret: process.env.JWTSECRET },
    );
    const jwt: any = this.jwtService.decode(accessToken);
    const token = await this.tokensService.saveToken(accessToken, sub, jwt.exp);
    return token.token;
  }
}
