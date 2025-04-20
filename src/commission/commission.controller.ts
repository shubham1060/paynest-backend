import { Controller, Get, Query } from '@nestjs/common';
import { CommissionService } from './commission.service';

@Controller('commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get()
  async getCommissionByUser(
    @Query('userId') userId?: string,
    @Query('phoneNumber') phoneNumber?: string,
  ) {
    return this.commissionService.getCommissionByUser({ userId, phoneNumber });
  }
}
