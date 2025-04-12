// invest/invest.dto.ts
import { IsMongoId, IsString } from 'class-validator';

export class CreateInvestmentDto {
  userId: string;
  productCode: string;
  productName: string;
  investAmount: number;
  totalEarnings: number;
  returnPeriodDays: number;
  periodicReturn: number;
  earningChancesTotal: number;
}

