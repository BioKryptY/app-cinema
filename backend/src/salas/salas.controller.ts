import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SalasService } from './salas.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@ApiTags('salas')
@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @ApiBearerAuth('token')       // mostra o cadeado no Swagger
  @UseGuards(AuthGuard('jwt'))  // só quem fez login pode alterar
  @Post()
  @ApiOperation({ summary: 'Criar uma sala' })
  @ApiResponse({ status: 201, description: 'Sala criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createSalaDto: CreateSalaDto) {
    return this.salasService.create(createSalaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as salas' })
  findAll() {
    return this.salasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma sala por ID' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  findOne(@Param('id') id: string) {
    return this.salasService.findOne(id);
  }

  @ApiBearerAuth('token')       // mostra o cadeado no Swagger
  @UseGuards(AuthGuard('jwt'))  // só quem fez login pode alterar
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma sala por ID' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  update(@Param('id') id: string, @Body() updateSalaDto: UpdateSalaDto) {
    return this.salasService.update(id, updateSalaDto);
  }

  @ApiBearerAuth('token')       // mostra o cadeado no Swagger
  @UseGuards(AuthGuard('jwt'))  // só quem fez login pode alterar
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma sala por ID' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  remove(@Param('id') id: string) {
    return this.salasService.remove(id);
  }
}