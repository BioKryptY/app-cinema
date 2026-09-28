import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SalasModule } from './salas/salas.module';
import { FilmesModule } from './filmes/filmes.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, SalasModule, FilmesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
