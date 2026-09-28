import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateLancheComboDto {
  @ApiProperty({ example: 'Combo Casal' })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: 'Pipoca grande + 2 refrigerantes' })
  @IsString()
  @MinLength(10)
  descricao!: string;

  @ApiProperty({ example: 45.9 })
  @IsNumber()
  @IsPositive()
  valorUnitario!: number;
}