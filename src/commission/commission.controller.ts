import { Controller, Get, Query } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { Commission } from 'src/schemas/commission.schema';

@Controller('api/commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) { }

  @Get()
  async getCommissionByUser(
    @Query('userId') userId?: string,
    @Query('phoneNumber') phoneNumber?: string,
  ) {
    return this.commissionService.getCommissionByUser({ userId, phoneNumber });
  }

  @Get('all')
  async getAllCommissions() {
    return this.commissionService.findAll(); // fetch all commission documents
  }
}
