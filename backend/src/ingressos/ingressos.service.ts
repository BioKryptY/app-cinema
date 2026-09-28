import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateIngressoDto } from './dto/create-ingresso.dto';
import { UpdateIngressoDto } from './dto/update-ingresso.dto';

@Injectable()
export class IngressosService {
  constructor(private prisma: PrismaService) {}

  create(createIngressoDto: CreateIngressoDto) {
    return this.prisma.ingresso.create({ data: createIngressoDto });
  }

  findAll(sessaoId?: string, pedidoId?: string) {
    // Se o filtro não for enviado, ele fica "undefined" e o Prisma simplesmente ignora
    return this.prisma.ingresso.findMany({
      where: { sessaoId, pedidoId },
    });
  }

  async findOne(id: string) {
    const ingresso = await this.prisma.ingresso.findUnique({ where: { id } });
    // Sem isso, buscar um id que não existe devolveria vazio com status 200
    if (!ingresso) throw new NotFoundException('Ingresso não encontrado');
    return ingresso;
  }

  async update(id: string, updateIngressoDto: UpdateIngressoDto) {
    await this.findOne(id); // garante que existe (senão dá 404 em vez de erro 500)
    return this.prisma.ingresso.update({ where: { id }, data: updateIngressoDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.ingresso.delete({ where: { id } });
  }
}