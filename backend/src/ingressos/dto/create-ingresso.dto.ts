import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateIngressoDto {
  @ApiPropertyOptional({ description: 'ID do pedido (opcional)' })
  @IsOptional()
  @IsString()
  pedidoId?: string;

  @ApiProperty({ description: 'ID da sessão' })
  @IsString()
  @IsNotEmpty()
  sessaoId!: string;

  @ApiProperty({ enum: ['inteira', 'meia'], example: 'inteira' })
  @IsIn(['inteira', 'meia'])
  tipo!: 'inteira' | 'meia';

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsPositive()
  valorInteira!: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @IsPositive()
  valorMeia!: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsPositive()
  valorFinal!: number;

  @ApiProperty({ example: '2026-10-05' })
  @IsString()
  @IsNotEmpty()
  dataCompra!: string;
}