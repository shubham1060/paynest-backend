// invest/invest.service.ts

import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Investment, InvestmentDocument } from '../schemas/invest.schema';
import { CreateInvestmentDto } from './invest.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { EarningRecordDocument } from '../schemas/earning-record.schema';


export interface EarningRecord {
  date: string;
  productName: string;
  amountReceived: number;
}

@Injectable()
export class InvestmentService {
  constructor(
    @InjectModel(Investment.name)
    private investmentModel: Model<InvestmentDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel('EarningRecord')
    private earningRecordModel: Model<EarningRecordDocument>,
  ) { }

  private readonly logger = new Logger(InvestmentService.name);

  private async saveEarningRecord({
    user,
    investment,
    payoutDate,
  }: {
    user: UserDocument;
    investment: InvestmentDocument;
    payoutDate: Date;
  }) {
    const record = new this.earningRecordModel({
      user: user._id,
      userId: user.userId,
      investment: investment._id,
      productName: investment.productName,
      amount: investment.periodicReturn,
      payoutDate,
      isSent: true,
    });

    await record.save();
  }

  private readonly investmentPlans = {
    DA: {
      name: 'Daily Income A',
      investAmount: 300,
      totalEarning: 900,
      returnPeriod: '30 Day',
      periodicReturn: 30,
      earningChances: 29,
    },
    DB: {
      name: 'Daily Income B',
      investAmount: 800,
      totalEarning: 2400,
      returnPeriod: '30 Day',
      periodicReturn: 80,
      earningChances: 29,
    },
    DC: {
      name: 'Daily Income C',
      investAmount: 20000,
      totalEarning: 55000,
      returnPeriod: '30 Day',
      periodicReturn: 1833,
      earningChances: 29,
    },
    EA1: {
      name: 'Eyes of the Future A1',
      investAmount: 599,
      totalEarning: 5000,
      returnPeriod: '1 Month',
      periodicReturn: 5000,
      earningChances: 1,
    },
    EA2: {
      name: 'Eyes of the Future A2',
      investAmount: 1999,
      totalEarning: 15000,
      returnPeriod: '1 Month',
      periodicReturn: 15000,
      earningChances: 1,
    },
    EA3: {
      name: 'Eyes of the Future A3',
      investAmount: 50000,
      totalEarning: 180000,
      returnPeriod: '1 Month',
      periodicReturn: 180000,
      earningChances: 1,
    },
  };

  async purchase(dto: CreateInvestmentDto): Promise<Investment> {
    const user = await this.userModel.findOne({ userId: dto.userId });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const plan = this.investmentPlans[dto.productCode];

    if (!plan) {
      throw new BadRequestException('Invalid product code');
    }

    if (typeof user.rechargeAmount !== 'number') {
      this.logger.error(`User rechargeAmount is invalid: ${user.rechargeAmount}`);
      throw new HttpException('User rechargeAmount is invalid', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (
      typeof dto.investAmount !== 'number' ||
      isNaN(dto.investAmount) ||
      dto.investAmount !== plan.investAmount
    ) {
      throw new HttpException(
        `Investment amount must be exactly ${plan.investAmount}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const alreadyPurchased = await this.investmentModel.findOne({
      user: user._id,
      productCode: dto.productCode,
    });

    if (alreadyPurchased) {
      throw new HttpException('You have already purchased this product', HttpStatus.BAD_REQUEST);
    }

    if (user.rechargeAmount < dto.investAmount) {
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    }

    user.rechargeAmount -= dto.investAmount;
    await user.save();

    const investment = new this.investmentModel({
      user: user._id,
      userId: user.userId,
      productCode: dto.productCode,
      productName: plan.name,
      investAmount: plan.investAmount,
      totalEarnings: plan.totalEarning,
      returnPeriod: plan.returnPeriod,
      periodicReturn: plan.periodicReturn,
      earningChancesTotal: plan.earningChances,
      earningChancesUsed: 0,
      earningsReceived: 0,
      isCompleted: false,
      nextPayoutDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
    });

    const savedInvestment = await investment.save();

    await this.handleReferralReward(user.userId, plan.investAmount);

    return savedInvestment;
  }

  async getOrdersByUser(userId: string): Promise<Investment[]> {
    return this.investmentModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  private async handleReferralReward(buyerUserId: string, productAmount: number) {
    const buyer = await this.userModel.findOne({ userId: buyerUserId });

    if (buyer?.invitationCode) {
      const inviter = await this.userModel.findOne({ referralCode: buyer.invitationCode });

      if (inviter) {
        const reward = productAmount * 0.1;
        inviter.balance += reward;
        await inviter.save();
        this.logger.log(`Referral reward of ${reward} given to ${inviter.userId}`);
      }
    }
  }

  async handleDailyAutomation(): Promise<void> {
    const now = new Date();

    // Round to the start of the current minute
    const nowStart = new Date(now);
    nowStart.setSeconds(0, 0);

    // One minute ahead
    const nowEnd = new Date(nowStart.getTime() + 60 * 1000);

    try {
      const dueInvestments = await this.investmentModel.find({
        isCompleted: false,
        nextPayoutDate: {
          $gte: nowStart,
          $lt: nowEnd, // any time within this minute
        },
      });

      if (dueInvestments.length === 0) return;

      // console.log(`⏰ ${dueInvestments.length} investment(s) due between ${nowStart.toISOString()} and ${nowEnd.toISOString()}`);

      for (const investment of dueInvestments) {
        const user = await this.userModel.findOne({ userId: investment.userId });
        if (!user) {
          console.warn(`⚠️ User not found for investment ${investment._id}`);
          continue;
        }

        const isDaily = investment.returnPeriod === '30 Day';
        const isMonthly = investment.returnPeriod === '1 Month';

        if (isDaily && investment.earningChancesUsed < investment.earningChancesTotal) {
          const periodicReturn = Number(investment.periodicReturn) || 0;
          const earningsReceived = Number(investment.earningsReceived) || 0;

          user.balance += periodicReturn;
          investment.earningsReceived = earningsReceived + periodicReturn;
          investment.earningChancesUsed += 1;

          // Set next payout time to exactly 24 hrs later (normalized to minute)
          const nextPayout = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          nextPayout.setSeconds(0, 0);
          investment.nextPayoutDate = nextPayout;

          if (investment.earningChancesUsed >= investment.earningChancesTotal) {
            investment.isCompleted = true;
          }

          await user.save();
          await investment.save();
          await this.saveEarningRecord({ user, investment, payoutDate: now });

          // console.log(`✅ Daily payout: ₹${periodicReturn} credited to ${user.userId}`);
        }

        else if (isMonthly && investment.earningChancesUsed < 1) {
          const periodicReturn = Number(investment.periodicReturn) || 0;

          user.balance += periodicReturn;
          investment.earningsReceived = periodicReturn;
          investment.earningChancesUsed = 1;
          investment.isCompleted = true;
          investment.nextPayoutDate = null;

          await user.save();
          await investment.save();
          await this.saveEarningRecord({ user, investment, payoutDate: now });

          // console.log(`✅ Monthly payout: ₹${periodicReturn} credited to ${user.userId}`);
        }
      }
    } catch (error) {
      console.error('❌ Error in handleDailyAutomation:', error);
    }
  }

  // This will run every minute (60000 ms)
  onModuleInit() {
    setInterval(() => {
      this.handleDailyAutomation();
    }, 60 * 1000); // run once every minute
  }

  async getEarningRecords(userId: string): Promise<EarningRecord[]> {
    const investments = await this.investmentModel.find({ userId });
    // console.log('investments==247==>', investments);

    const records: EarningRecord[] = [];

    for (const investment of investments) {
      const {
        productName,
        periodicReturn,
        returnPeriod,
        earningChancesUsed,
        createdAt,
      } = investment;

      const isMonthly = returnPeriod === '1 Month';
      const baseDate = new Date(createdAt);

      if (isMonthly && earningChancesUsed > 0) {
        const payoutDate = new Date(baseDate);
        payoutDate.setDate(payoutDate.getDate() + 30);
        records.push({
          date: payoutDate.toISOString().split('T')[0],
          productName,
          amountReceived: periodicReturn,
        });
      } else {
        for (let i = 0; i < earningChancesUsed; i++) {
          const payoutDate = new Date(baseDate);
          payoutDate.setDate(payoutDate.getDate() + i + 1);
          records.push({
            date: payoutDate.toISOString().split('T')[0],
            productName,
            amountReceived: periodicReturn,
          });
        }
      }
    }

    return records.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  async findAll(): Promise<Investment[]> {
    return this.investmentModel.find().populate('user', 'name email').exec();
  }
}
