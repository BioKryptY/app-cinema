import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IngressosService } from './ingressos.service';
import { CreateIngressoDto } from './dto/create-ingresso.dto';
import { UpdateIngressoDto } from './dto/update-ingresso.dto';

@ApiTags('ingressos')
@ApiBearerAuth('token')       // mostra o cadeado no Swagger
@UseGuards(AuthGuard('jwt'))  // exige token em TODAS as rotas desta classe
@Controller('ingressos')
export class IngressosController {
  constructor(private readonly ingressosService: IngressosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um ingresso' })
  @ApiResponse({ status: 201, description: 'Ingresso criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createIngressoDto: CreateIngressoDto) {
    return this.ingressosService.create(createIngressoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ingressos (pode filtrar por sessão ou pedido)' })
  @ApiQuery({ name: 'sessaoId', required: false })
  @ApiQuery({ name: 'pedidoId', required: false })
  findAll(@Query('sessaoId') sessaoId?: string, @Query('pedidoId') pedidoId?: string) {
    return this.ingressosService.findAll(sessaoId, pedidoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um ingresso por ID' })
  @ApiResponse({ status: 404, description: 'Ingresso não encontrado' })
  findOne(@Param('id') id: string) {
    return this.ingressosService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um ingresso por ID' })
  @ApiResponse({ status: 404, description: 'Ingresso não encontrado' })
  update(@Param('id') id: string, @Body() updateIngressoDto: UpdateIngressoDto) {
    return this.ingressosService.update(id, updateIngressoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um ingresso por ID' })
  @ApiResponse({ status: 404, description: 'Ingresso não encontrado' })
  remove(@Param('id') id: string) {
    return this.ingressosService.remove(id);
  }
}
