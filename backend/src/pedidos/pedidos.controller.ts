import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@ApiTags('pedidos')
@ApiBearerAuth('token')       // mostra o cadeado no Swagger
@UseGuards(AuthGuard('jwt'))  // exige token em TODAS as rotas desta classe
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos (pode filtrar por sessão)' })
  @ApiQuery({ name: 'sessaoId', required: false })
  findAll(@Query('sessaoId') sessaoId?: string) {
    return this.pedidosService.findAll(sessaoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pedido por ID' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um pedido por ID' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidosService.update(id, updatePedidoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um pedido por ID' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(id);
  }
}
