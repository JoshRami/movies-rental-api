import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Token } from './tokens.entity';
import { TokensService } from './tokens.service';
import { TokensService } from './tokens/tokens.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Token]), UsersModule],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
