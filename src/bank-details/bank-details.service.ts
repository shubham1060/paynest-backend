// src/bank-details/bank-details.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
    try {
      const newDetails = new this.bankDetailsModel(createDto);
      console.log('newDetails==17=>', newDetails);
      return await newDetails.save();
    } catch (err) {
      console.error("Mongoose error in create():", err.message);
      throw new InternalServerErrorException("Bank detail creation failed");
    }
  }

  async getBankDetailsByUserId(userId: string): Promise<BankDetails[]> {
    return this.bankDetailsModel.find({ userId }).exec();
  }

  async findAll(): Promise<BankDetails[]> {
    return this.bankDetailsModel.find().exec();
  }
}
