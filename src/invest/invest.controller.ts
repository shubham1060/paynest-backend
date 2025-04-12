// invest/invest.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { InvestmentService } from './invest.service';
import { CreateInvestmentDto } from './invest.dto';

@Controller('invest')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post('purchase')
  async purchase(@Body() dto: CreateInvestmentDto) {
    const investment = await this.investmentService.purchase(dto);
    return {
      message: 'Investment successful',
      investment,
    };
  }
}
