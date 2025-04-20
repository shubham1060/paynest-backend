// src/bank-details/dto/create-bank-details.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBankDetailsDto {
  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsNotEmpty()
  @IsString()
  ifsc: string;

  @IsNotEmpty()
  @IsString()
  cardholderName: string;

  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  user: string;
}
