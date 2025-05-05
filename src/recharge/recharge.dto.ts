//recharge.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRechargeDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsString()
  upiId?: string;

  @IsString()
  utr?: string;
}
