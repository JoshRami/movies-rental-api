import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AssociateEmailDto {
  @ApiProperty({ description: 'most be unique' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
