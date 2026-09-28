import { PartialType } from '@nestjs/swagger';
import { CreateSalaDto } from './create-sala.dto';

// PartialType = mesmos campos do Create, mas todos opcionais
export class UpdateSalaDto extends PartialType(CreateSalaDto) {}