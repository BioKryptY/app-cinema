import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LanchesCombosService } from './lanches-combos.service';
import { CreateLancheComboDto } from './dto/create-lanches-combo.dto';
import { UpdateLanchesComboDto } from './dto/update-lanches-combo.dto';

@ApiTags('lanchesCombos')
@Controller('lanchesCombos')
export class LanchesCombosController {
  constructor(private readonly lanchesCombosService: LanchesCombosService) {}

  @ApiBearerAuth('token')       // mostra o cadeado no Swagger
  @UseGuards(AuthGuard('jwt'))  // só quem fez login pode alterar
  @Post()
  @ApiOperation({ summary: 'Criar um Lanche Combo' })
  @ApiResponse({ status: 201, description: 'Lanche Combo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createLanchesComboDto: CreateLancheComboDto) {
    return this.lanchesCombosService.create(createLanchesComboDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos Lanche Combo' })
  findAll() {
    return this.lanchesCombosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma Lanche Combo por ID' })
  @ApiResponse({ status: 404, description: 'Lanche Combo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.lanchesCombosService.findOne(id);
  }

  @ApiBearerAuth('token')       // mostra o cadeado no Swagger
  @UseGuards(AuthGuard('jwt'))  // só quem fez login pode alterar
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um Lanche Combo por ID' })
  @ApiResponse({ status: 404, description: 'Lanche Combo não encontrado' })
  update(@Param('id') id: string, @Body() updateLanchesComboDto: UpdateLanchesComboDto) {
    return this.lanchesCombosService.update(id, updateLanchesComboDto);
  }

  @ApiBearerAuth('token')       // mostra o cadeado no Swagger
  @UseGuards(AuthGuard('jwt'))  // só quem fez login pode alterar
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um Lanche Combo por ID' })
  @ApiResponse({ status: 404, description: 'Lanche Combo não encontrado' })
  remove(@Param('id') id: string) {
    return this.lanchesCombosService.remove(id);
  }
}
