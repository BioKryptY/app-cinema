import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateSessaoDto {
  @ApiProperty({ description: 'ID do filme', example: 'cole-aqui-o-id-de-um-filme' })
  @IsString()
  @IsNotEmpty()
  filmeId!: string;

  @ApiProperty({ description: 'ID da sala', example: 'cole-aqui-o-id-de-uma-sala' })
  @IsString()
  @IsNotEmpty()
  salaId!: string;

  @ApiProperty({ example: '2026-10-05T19:30' })
  @IsString()
  @IsNotEmpty()
  dataHora!: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsPositive()
  precoBase!: number;
}