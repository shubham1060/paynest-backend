// src/bank/bank.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bank, BankDocument } from '../schemas/bank.schema';
import { Model } from 'mongoose';

@Injectable()
export class BankService {
  constructor(@InjectModel(Bank.name) private bankModel: Model<BankDocument>) {}

  async findAll(): Promise<Bank[]> {
    return this.bankModel.find().sort({ name: 1 }).exec(); // sorted A-Z
  }
}
