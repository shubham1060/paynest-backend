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
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  invitationCode?: string;
}
