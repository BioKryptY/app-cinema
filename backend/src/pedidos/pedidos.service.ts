import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  create(createPedidoDto: CreatePedidoDto) {
    // Separa a lista de lanches do resto dos dados do pedido
    const { lanches, ...pedido } = createPedidoDto;

    return this.prisma.pedido.create({
      data: {
        ...pedido,
        lanches: { create: lanches }, // cria os itens junto, já ligados ao pedido
      },
      include: { lanches: true },     // devolve o pedido com os itens
    });
  }

  findAll(sessaoId?: string) {
    return this.prisma.pedido.findMany({
      where: { sessaoId },
      include: { lanches: true },
    });
  }

  async findOne(id: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { lanches: true },
    });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');
    return pedido;
  }

  async update(id: string, updatePedidoDto: UpdatePedidoDto) {
    await this.findOne(id);
    const { lanches, ...pedido } = updatePedidoDto;

    return this.prisma.pedido.update({
      where: { id },
      data: {
        ...pedido,
        // Se veio uma lista nova de lanches: apaga os itens antigos e cria os novos
        lanches: lanches ? { deleteMany: {}, create: lanches } : undefined,
      },
      include: { lanches: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Os itens de lanche são apagados junto (onDelete: Cascade no schema)
    return this.prisma.pedido.delete({ where: { id } });
  }
}
