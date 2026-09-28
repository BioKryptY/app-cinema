import { Injectable , NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFilmeDto } from './dto/create-filme.dto';
import { UpdateFilmeDto } from './dto/update-filme.dto';

@Injectable()
export class FilmesService {
  constructor(private prisma: PrismaService) {}

  create(createFilmeDto: CreateFilmeDto) {
    return this.prisma.filme.create({ data: createFilmeDto });
  }

  findAll() {
    return this.prisma.filme.findMany();
  }

  async findOne(id: string) {
    const filme = await this.prisma.filme.findUnique({ where: { id } });
    // Sem isso, buscar um id que não existe devolveria vazio com status 200
    if (!filme) throw new NotFoundException('Filme não encontrado');
    return filme;
  }

  async update(id: string, updateFilmeDto: UpdateFilmeDto) {
    await this.findOne(id); // garante que existe (senão dá 404 em vez de erro 500)
    return this.prisma.filme.update({ where: { id }, data: updateFilmeDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.filme.delete({ where: { id } });
  }
}
