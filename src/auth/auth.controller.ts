import { Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { TokensService } from 'src/tokens/tokens.service';
import { AuthService } from './auth.service';
import { CredentialsDto } from './dtos/credentials.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WhitelistGuard } from './guards/jwt-whitelist.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokensService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'The login has been successfully done.',
  })
  @ApiResponse({ status: 401, description: 'Bad credentials, user not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: CredentialsDto })
  @Post('login')
  @HttpCode(200)
  async login(@Req() req) {
    const user = req.user;
    const accessToken = await this.authService.login(user);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiResponse({
    status: 204,
    description: 'The logout has been successfully done.',
  })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async logout(@Req() req: Request) {
    const accessToken = req.get('Authorization').split(' ')[1];
    await this.tokenService.deleteToken(accessToken);
  }
}
