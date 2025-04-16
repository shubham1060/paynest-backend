// invest/invest.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { InvestmentService } from './invest.service';
import { CreateInvestmentDto } from './invest.dto';

@Controller('invest')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post('purchase')
  async purchase(@Body() dto: CreateInvestmentDto) {
    console.log('Received DTO==12==>', dto);
    const investment = await this.investmentService.purchase(dto);
    return {
      message: 'Investment successful',
      investment,
    };
  }

  @Get('orders/:userId')
  async getOrdersByUser(@Param('userId') userId: string) {
    return this.investmentService.getOrdersByUser(userId);
  }

}
