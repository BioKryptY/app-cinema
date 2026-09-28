import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilmesService } from './filmes.service';
import { CreateFilmeDto } from './dto/create-filme.dto';
import { UpdateFilmeDto } from './dto/update-filme.dto';

@ApiTags('filmes')
@Controller('filmes')
export class FilmesController {
  constructor(private readonly filmesService: FilmesService) {}

  @Post()
  @ApiBearerAuth('token')       // mostra o cadeado no Swagger
  @UseGuards(AuthGuard('jwt'))  // só quem fez login pode alterar
  @ApiOperation({ summary: 'Criar um filme' })
  @ApiResponse({ status: 201, description: 'Filme criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createFilmeDto: CreateFilmeDto) {
    return this.filmesService.create(createFilmeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os filmes' })
  findAll() {
    return this.filmesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um filme por ID' })
  @ApiResponse({ status: 404, description: 'Filme não encontrado' })
  findOne(@Param('id') id: string) {
    return this.filmesService.findOne(id);
  }

  @ApiBearerAuth('token')       // mostra o cadeado no Swagger
  @UseGuards(AuthGuard('jwt'))  // só quem fez login pode alterar
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um filme por ID' })
  @ApiResponse({ status: 404, description: 'Filme não encontrado' })
  update(@Param('id') id: string, @Body() updateFilmeDto: UpdateFilmeDto) {
    return this.filmesService.update(id, updateFilmeDto);
  }

  @Delete(':id')
  @ApiBearerAuth('token')       // Habilita cadeado no Swagger para esta rota
  @UseGuards(AuthGuard('jwt'))  // Exige o token nesta rota
  @ApiOperation({ summary: 'Excluir uma filme por ID' })
  @ApiResponse({ status: 404, description: 'Filme não encontrado' })
  remove(@Param('id') id: string) {
    return this.filmesService.remove(id);
  }
}
