import { PartialType } from '@nestjs/swagger';
import { CreateLancheComboDto } from './create-lanches-combo.dto';

export class UpdateLanchesComboDto extends PartialType(CreateLancheComboDto) {}
