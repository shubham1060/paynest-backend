// invest/invest.dto.ts
import { IsMongoId, IsNumber, IsString } from 'class-validator';

export class CreateInvestmentDto {
  @IsString()
  userId: string;

  @IsString()
  productCode: string;

  @IsNumber()
  investAmount: number;  
}

