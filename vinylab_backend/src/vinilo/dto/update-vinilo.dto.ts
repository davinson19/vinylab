import { PartialType } from '@nestjs/mapped-types';
import { CreateViniloDto } from './create-vinilo.dto';

export class UpdateViniloDto extends PartialType(CreateViniloDto) {}
