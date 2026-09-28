import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateFilmeDto {
  @ApiProperty({ example: 'Duna: Parte Dois' })
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiProperty({ example: 'Paul Atreides se une aos Fremen...' })
  @IsString()
  @MinLength(10)
  sinopse!: string;

  @ApiProperty({ example: '14' })
  @IsString()
  @IsNotEmpty()
  classificacao!: string;

  @ApiProperty({ description: 'Duração em minutos', example: 166 })
  @IsInt()
  @IsPositive()
  duracao!: number;

  @ApiProperty({ example: 'Ficção científica' })
  @IsString()
  @IsNotEmpty()
  genero!: string;

  @ApiProperty({ example: '2026-10-01' })
  @IsString()
  @IsNotEmpty()
  dataInicio!: string;

  @ApiProperty({ example: '2026-10-31' })
  @IsString()
  @IsNotEmpty()
  dataFim!: string;
}