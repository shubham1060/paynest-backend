// src/bank/bank.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';
import { Bank, BankSchema } from '../schemas/bank.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Bank.name, schema: BankSchema }])],
  controllers: [BankController],
  providers: [BankService],
})
export class BankModule {}
