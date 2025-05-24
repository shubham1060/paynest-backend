import { Injectable, HttpException, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WithdrawDto } from './withdraw.dto';
import { Withdrawal, WithdrawalDocument } from '../schemas/withdraw.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class WithdrawalsService {
  constructor(
    @InjectModel(Withdrawal.name)
    private readonly withdrawalModel: Model<WithdrawalDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) { }

  async processWithdrawal(body: WithdrawDto) {
    const { userId, amount, bankAccount } = body;

    // 1. Fetch the user
    const user = await this.userModel.findOne({ userId }); // if userId is a string
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // 2. Validate balance
    if (user.balance < amount) {
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    }

    // 3. Create a withdrawal record
    const withdrawal = new this.withdrawalModel({
      userId: user.userId,
      amount,
      bankAccount,
      status: 'Payment Pending',
    });

    await withdrawal.save();

    // 4. Deduct balance from user
    user.balance -= amount;
    await user.save();

    return withdrawal;
  }

  async getWithdrawalRecordsByUserId(userId: string): Promise<Withdrawal[]> {
    const records = await this.withdrawalModel.find({ userId }).sort({ createdAt: -1 }).lean(); // lean() makes the result plain JS objects

    return records.map((record) => {
      const withdrawMoney = record.amount;
      const withdrawTax = parseFloat((withdrawMoney / 10).toFixed(2));
      const arrivalMoney = parseFloat((withdrawMoney - withdrawTax).toFixed(2));

      return { ...record, withdrawTax, withdrawMoney, arrivalMoney };
    });
  }
  async findAll() {
    return this.withdrawalModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateStatus(withdrawalId: string, status: 'Payment Success' | 'Payment Failed') {
    const withdrawal = await this.withdrawalModel.findById(withdrawalId);
    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status !== 'Payment Pending') {
      throw new BadRequestException('Withdrawal already processed');
    }

    withdrawal.status = status;
    withdrawal.updatedAt = new Date();
    await withdrawal.save();

    return { success: true, message: 'Withdrawal status updated successfully' };
  }
} 
