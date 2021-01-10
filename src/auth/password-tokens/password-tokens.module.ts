import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { PasswordToken } from './passwords-token.entity';
import { PasswordTokenService } from './password-tokens.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PasswordToken]), UsersModule],
  providers: [PasswordTokenService],
  exports: [PasswordTokenService],
})
export class PasswordTokensModule {}
