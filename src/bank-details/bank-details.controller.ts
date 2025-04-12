// src/bank-details/bank-details.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { BankDetailsService } from './bank-details.service';
import { CreateBankDetailsDto } from './bank-details.dto';

@Controller('api/bank-details')
export class BankDetailsController {
  constructor(private readonly bankDetailsService: BankDetailsService) {}

  @Post()
  async create(@Body() createDto: CreateBankDetailsDto) {
    return this.bankDetailsService.create(createDto);
  }

  @Get()
  async findAll() {
    return this.bankDetailsService.findAll();
  }
}
