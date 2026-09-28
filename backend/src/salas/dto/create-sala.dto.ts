import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateSalaDto {
  @ApiProperty({ description: 'Número da sala', example: 1 })
  @IsInt()
  @IsPositive()
  numero!: number;

  @ApiProperty({ description: 'Quantidade de lugares', example: 120 })
  @IsInt()
  @IsPositive()
  capacidade!: number;
}