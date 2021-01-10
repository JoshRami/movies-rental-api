import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordToken } from './passwords-token.entity';
import { UsersService } from '../../users/users.service';
import { LessThan, Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PasswordTokenService {
  constructor(
    @InjectRepository(PasswordToken)
    private readonly passwordTokenRepository: Repository<PasswordToken>,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  async generatePasswordToken(email: string) {
    const user = await this.usersService.getUserByEmail(email);
    const maxRandomNumber = 100000;

    const token = Math.floor(Math.random() * maxRandomNumber) + 1;
    const tokenMinutesLifetime = 5;

    const passwordToken = this.passwordTokenRepository.create({
      token,
      user,
      endTime: new Date(Date.now() + tokenMinutesLifetime * 60 * 1000),
    });

    await this.passwordTokenRepository.save(passwordToken);

    await this.mailerService.sendMail({
      to: user.email,
      from: 'ia.josuequinteros@ufg.edu.sv',
      template: 'reset-password',
      subject: 'Important: Reset Password',
      context: {
        token: passwordToken.token,
        expiresIn: passwordToken.endTime,
      },
    });
  }

  async validatePasswordToken(token: number, email: string) {
    const passwordToken = await this.passwordTokenRepository.findOne({
      relations: ['user'],
      where: { token },
    });
    const user = await this.usersService.getUserByEmail(email);

    if (user.email !== email) {
      throw new UnauthorizedException(
        'Email passed not coincides with password token email owner',
      );
    }
    if (!passwordToken) {
      throw new UnauthorizedException('Token code not exist');
    }
    if (passwordToken.endTime < new Date()) {
      throw new UnauthorizedException('Password token is exprired');
    }
  }

  async deleteToken(token: number) {
    await this.passwordTokenRepository.delete({ token });
  }

  @Cron('*/10 * * * *')
  async deleteExpiredPasswordTokens() {
    try {
      await this.passwordTokenRepository.delete({
        endTime: LessThan(new Date()),
      });
    } catch (error) {
      console.error('error while deleting expired password tokens');
    }
  }
}
