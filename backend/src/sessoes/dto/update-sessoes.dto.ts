import { PartialType } from '@nestjs/swagger';
import { CreateSessaoDto } from './create-sessoes.dto';

export class UpdateSessaoDto extends PartialType(CreateSessaoDto) {}
