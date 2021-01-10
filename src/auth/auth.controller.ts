import {
  Body,
  Controller,
  HttpCode,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { TokensService } from 'src/tokens/tokens.service';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dtos/change.password.dto';
import { CredentialsDto } from './dtos/credentials.dto';
import { AskResetPasswordDto } from './dtos/ask.reset.password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WhitelistGuard } from './guards/jwt-whitelist.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ResetPasswordDto } from './dtos/reset.password.dto';

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
  @ApiResponse({
    status: 400,
    description: 'You have submitted wrong input data',
  })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: CredentialsDto })
  @Post('login')
  @HttpCode(201)
  async login(@Req() req) {
    const user = req.user;
    const accessToken = await this.authService.login(user);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiResponse({
    status: 204,
    description: 'The logout has been successfully done.',
  })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'You have  submitted wrong data' })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async logout(@Req() req: Request) {
    const accessToken = req.get('Authorization').split(' ')[1];
    await this.tokenService.deleteToken(accessToken);
  }

  @Put('/me/password/change')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiResponse({
    status: 204,
    description: 'The password has been successfully change.',
  })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'You have submitted wrong data' })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    await this.authService.changeUserPassword(userId, changePasswordDto);
  }

  @Post('/me/password/reset')
  @HttpCode(202)
  @ApiResponse({
    status: 202,
    description:
      'The reset password token has been successfully generated and a email has been sent',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 400,
    description:
      'You have submitted wrong data or email is not associated with an existing user',
  })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async generatePasswordResetCode(
    @Body() askResetPasswordDto: AskResetPasswordDto,
  ) {
    await this.authService.askResetPassword(askResetPasswordDto);
  }

  @Put('/me/password/reset/set-password')
  @HttpCode(204)
  @ApiResponse({
    status: 204,
    description: 'The password has been successfully changed ',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 400,
    description:
      'You have submitted wrong data or email is not associated with an existing user',
  })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async setPasswordByResetCode(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
  }
}
