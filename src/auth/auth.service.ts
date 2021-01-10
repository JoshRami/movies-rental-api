import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from '../tokens/tokens.service';
import { TokenDoc } from './docs/token.doc';
import { plainToClass } from 'class-transformer';
import { UserDoc } from '../users/docs/user.doc';
import { ChangePasswordDto } from './dtos/change.password.dto';
import { PasswordTokenService } from './password-tokens/password-tokens.service';
import { ResetPasswordDto } from './dtos/reset.password.dto';
import { AskResetPasswordDto } from './dtos/ask.reset.password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokensService: TokensService,
    private readonly passwordTokenService: PasswordTokenService,
  ) {}

  async validateUser(email: string, password: string) {
    const foundUser = await this.usersService.findByCredentials(
      email,
      password,
    );
    return foundUser;
  }

  async login(user: UserDoc) {
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

  async changeUserPassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ) {
    const passwordToChange = changePasswordDto.password;
    await this.usersService.changeUserPassword(userId, passwordToChange);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, token, password } = resetPasswordDto;
    await this.passwordTokenService.validatePasswordToken(token, email);
    const user = await this.usersService.getUserByEmail(email);
    await this.usersService.changeUserPassword(user.id, password);
  }

  async askResetPassword(askResetPasswordDto: AskResetPasswordDto) {
    const userEmail = askResetPasswordDto.email;
    await this.passwordTokenService.generatePasswordToken(userEmail);
  }
}
