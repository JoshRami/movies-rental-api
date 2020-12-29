import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Token } from './tokens.entity';
import { UsersService } from '../users/users.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly usersService: UsersService,
  ) {}

  async checkToken(token: string) {
    const existToken = await this.tokenRepository.findOne({ token });
    if (!existToken) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async saveToken(token: string, userId: number, expires: number) {
    const user = await this.usersService.getUser(userId);
    const newToken = new Token();
    newToken.endTime = new Date(expires * 1000);
    newToken.user = user;
    newToken.token = token;
    return await this.tokenRepository.save(newToken);
  }
  async deleteToken(token: string) {
    const IS_AFFECTED = 1;
    const { affected } = await this.tokenRepository.delete({ token });
    return affected === IS_AFFECTED;
  }

  @Cron('*/3 * * * *')
  async deleteExpiredTokens() {
    try {
      await this.tokenRepository.delete({ endTime: LessThan(new Date()) });
    } catch (error) {
      console.error('error while deleting expired tokens');
    }
  }
}
