// src/bank/bank.controller.ts
import { Controller, Get } from '@nestjs/common';
import { BankService } from './bank.service';
import { Bank } from '../schemas/bank.schema';

@Controller('api/banks')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get()
  async getBanks(): Promise<Bank[]> {
    return this.bankService.findAll();
  }
}
