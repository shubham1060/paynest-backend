import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class ResetPasswordDto {
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}