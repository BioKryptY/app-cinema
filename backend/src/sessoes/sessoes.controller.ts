import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SessoesService } from './sessoes.service';
import { CreateSessaoDto } from './dto/create-sessoes.dto';
import { UpdateSessaoDto } from './dto/update-sessoes.dto';

@ApiTags('sessoes')
@Controller('sessoes')
export class SessoesController {
  constructor(private readonly sessoesService: SessoesService) {}

  @ApiBearerAuth('token')       // mostra o cadeado no Swagger
  @UseGuards(AuthGuard('jwt'))  // só quem fez login pode alterar
  @Post()
  @ApiOperation({ summary: 'Criar uma sessão' })
  @ApiResponse({ status: 201, description: 'Sessão criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createSessaoDto: CreateSessaoDto) {
    return this.sessoesService.create(createSessaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as sessões' })
  findAll() {
    return this.sessoesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma sessão por ID' })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
  findOne(@Param('id') id: string) {
    return this.sessoesService.findOne(id);
  }

  @ApiBearerAuth('token')       // mostra o cadeado no Swagger
  @UseGuards(AuthGuard('jwt'))  // só quem fez login pode alterar
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma sessão por ID' })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
  update(@Param('id') id: string, @Body() updateSessaoDto: UpdateSessaoDto) {
    return this.sessoesService.update(id, updateSessaoDto);
  }

  @ApiBearerAuth('token')       // mostra o cadeado no Swagger
  @UseGuards(AuthGuard('jwt'))  // só quem fez login pode alterar
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma sessão por ID' })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
  remove(@Param('id') id: string) {
    return this.sessoesService.remove(id);
  }
}