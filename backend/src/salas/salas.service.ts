import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@Injectable()
export class SalasService {
  constructor(private prisma: PrismaService) {}

  create(createSalaDto: CreateSalaDto) {
    return this.prisma.sala.create({ data: createSalaDto });
  }

  findAll() {
    return this.prisma.sala.findMany();
  }

  async findOne(id: string) {
    const sala = await this.prisma.sala.findUnique({ where: { id } });
    // Sem isso, buscar um id que não existe devolveria vazio com status 200
    if (!sala) throw new NotFoundException('Sala não encontrada');
    return sala;
  }

  async update(id: string, updateSalaDto: UpdateSalaDto) {
    await this.findOne(id); // garante que existe (senão dá 404 em vez de erro 500)
    return this.prisma.sala.update({ where: { id }, data: updateSalaDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sala.delete({ where: { id } });
  }
}