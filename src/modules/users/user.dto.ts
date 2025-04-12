import { IsString, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('IN')
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  invitationCode?: string;
}
