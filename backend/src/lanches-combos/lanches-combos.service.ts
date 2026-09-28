import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLancheComboDto } from './dto/create-lanches-combo.dto';
import { UpdateLanchesComboDto } from './dto/update-lanches-combo.dto';

@Injectable()
export class LanchesCombosService {
  constructor(private prisma: PrismaService) {}

  create(createLancheComboDto: CreateLancheComboDto) {
    return this.prisma.lancheCombo.create({ data: createLancheComboDto });
  }

  findAll() {
    return this.prisma.lancheCombo.findMany();
  }

  async findOne(id: string) {
    const lancheCombo = await this.prisma.lancheCombo.findUnique({ where: { id } });
    // Sem isso, buscar um id que não existe devolveria vazio com status 200
    if (!lancheCombo) throw new NotFoundException('LancheCombo não encontrado');
    return lancheCombo;
  }

  async update(id: string, updateLanchesComboDto: UpdateLanchesComboDto) {
    await this.findOne(id); // garante que existe (senão dá 404 em vez de erro 500)
    return this.prisma.lancheCombo.update({ where: { id }, data: updateLanchesComboDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lancheCombo.delete({ where: { id } });
  }
}
