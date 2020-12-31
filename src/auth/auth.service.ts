import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from 'src/tokens/tokens.service';
import { TokenDoc } from './docs/token.doc';
import { User } from 'src/users/users.entity';
import { plainToClass } from 'class-transformer';
import { UserDoc } from '../users/docs/user.doc';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokensService: TokensService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const foundUser = await this.usersService.findByCredentials(
      username,
      password,
    );
    return foundUser;
  }

  async login(user: UserDoc): Promise<string> {
    const tokenData = plainToClass(TokenDoc, user, {
      excludeExtraneousValues: true,
    });
    const { username, sub } = tokenData;

    const accessToken = this.jwtService.sign(
      { username, sub },
      { secret: process.env.JWTSECRET },
    );
    const jwt: any = this.jwtService.decode(accessToken);
    const token = await this.tokensService.saveToken(accessToken, sub, jwt.exp);
    return token.token;
  }
}
