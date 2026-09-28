import { Module } from '@nestjs/common';
import { SessoesService } from './sessoes.service';
import { SessoesController } from './sessoes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ PrismaModule],
  controllers: [SessoesController],
  providers: [SessoesService],
})
export class SessoesModule {}
