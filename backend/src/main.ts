import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // whitelist: descarta campos que não estão no DTO (ex.: o "id" que o frontend manda junto)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // Ativa validação dos DTOs

  const config = new DocumentBuilder()
  .setTitle('Documentação da API - CineWeb')
  .setDescription('CineWeb - API')
  .setVersion('1.0')
  .addTag('users')
  .addTag('auth')
  .addTag('salas')
  .addTag('filmes')
  .addTag('lanchesCombos')
  .addTag('sessoes')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      in: 'header',
    },
    'token',
  )
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
