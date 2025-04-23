// src/bank-details/bank-details.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BankDetails, BankDetailsDocument } from '../schemas/bank-details.schema';
import { CreateBankDetailsDto } from './bank-details.dto';

@Injectable()
export class BankDetailsService {
  constructor(
    @InjectModel(BankDetails.name) private bankDetailsModel: Model<BankDetailsDocument>
  ) {}

  async create(createDto: CreateBankDetailsDto): Promise<BankDetails> {
    const newDetails = new this.bankDetailsModel(createDto);
    return newDetails.save();
  }

  async findAll(): Promise<BankDetails[]> {
    return this.bankDetailsModel.find().exec();
  }
}
