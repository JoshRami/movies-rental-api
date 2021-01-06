import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/db.exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');

  const options = new DocumentBuilder()
    .setTitle('Movie Rental App')
    .setDescription(
      'This API let you to handle movies, tags related to movies, and user. Also users can rent or buy movies.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.use(json(), helmet());
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('tiny'));
  }

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = parseInt(process.env.PORT) || 3000;
  await app.listen(port);
}
bootstrap();
