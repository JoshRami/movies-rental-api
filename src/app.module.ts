import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { TagsModule } from './tags/tags.module';
import { AuthModule } from './auth/auth.module';
import { RentsModule } from './rents/rents.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot(),
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    MoviesModule,
    TagsModule,
    AuthModule,
    RentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
