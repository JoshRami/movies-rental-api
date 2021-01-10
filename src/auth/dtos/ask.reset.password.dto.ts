import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AskResetPasswordDto {
  @ApiProperty({ description: 'user email to change password' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
