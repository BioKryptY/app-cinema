import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Min, ValidateNested,
} from 'class-validator';

// Um lanche dentro do pedido
export class ItemPedidoDto {
  @ApiProperty({ description: 'ID do lanche/combo' })
  @IsString()
  @IsNotEmpty()
  lancheComboId!: string;

  @ApiProperty({ example: 'Combo Casal' })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: 45.9 })
  @IsNumber()
  @IsPositive()
  valorUnitario!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  qtUnidade!: number;

  @ApiProperty({ example: 91.8 })
  @IsNumber()
  @IsPositive()
  subtotal!: number;
}

export class CreatePedidoDto {
  @ApiProperty({ description: 'ID da sessão' })
  @IsString()
  @IsNotEmpty()
  sessaoId!: string;

  @ApiProperty({ example: '2026-10-05' })
  @IsString()
  @IsNotEmpty()
  dataPedido!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  qtInteira!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  qtMeia!: number;

  @ApiProperty({ type: [ItemPedidoDto] })
  @IsArray()
  @ValidateNested({ each: true }) // valida cada item da lista...
  @Type(() => ItemPedidoDto)      // ...usando as regras do ItemPedidoDto
  lanches!: ItemPedidoDto[];

  @ApiProperty({ example: 75 })
  @IsNumber()
  @Min(0)
  valorIngressos!: number;

  @ApiProperty({ example: 91.8 })
  @IsNumber()
  @Min(0)
  valorLanches!: number;

  @ApiProperty({ example: 166.8 })
  @IsNumber()
  @IsPositive()
  valorTotal!: number;
}
