import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Roles } from '../roles/roles.enum';

export class UpdateUserRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(Roles))
  role: string;
}
