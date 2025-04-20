// invest/invest.service.ts
import { Injectable, BadRequestException, HttpException, HttpStatus, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Investment, InvestmentDocument } from '../schemas/invest.schema';
import { CreateInvestmentDto } from './invest.dto';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectModel(Investment.name) private investmentModel: Model<InvestmentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  private investmentPlans = {
    DA: { name: 'Daily Income A', investAmount: 300, totalEarning: 900, returnPeriod: '30 Day', periodicReturn: 30, earningChances: 30, productPurchase:1 },
    DB: { name: 'Daily Income B', investAmount: 800, totalEarning: 2400, returnPeriod: '30 Day', periodicReturn: 80, earningChances: 30, productPurchase:1 },
    DC: { name: 'Daily Income C', investAmount: 20000, totalEarning: 55000, returnPeriod: '30 Day', periodicReturn: 1833, earningChances: 30, productPurchase:1 },
    EA1: { name: 'Eyes of the Future A1', investAmount: 599, totalEarning: 5000, returnPeriod: '1 Month', periodicReturn: 5000, earningChances: 1, productPurchase: 1 },
    EA2: { name: 'Eyes of the Future A2', investAmount: 1999, totalEarning: 15000, returnPeriod: '1 Month', periodicReturn: 15000, earningChances: 1, productPurchase: 1 },
    EA3: { name: 'Eyes of the Future A3', investAmount: 50000, totalEarning: 180000, returnPeriod: '1 Month', periodicReturn: 180000, earningChances: 1, productPurchase: 1 },
  };

  async purchase(dto: CreateInvestmentDto): Promise<Investment> {
    const user = await this.userModel.findOne({ userId: dto.userId });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const plan = this.investmentPlans[dto.productCode];
    if (!plan) throw new BadRequestException('Invalid product code');

    if (typeof user.rechargeAmount !== 'number') {
      console.error('User rechargeAmount is not a number:', user.rechargeAmount);
      throw new HttpException('User rechargeAmount is invalid', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (typeof dto.investAmount !== 'number' || isNaN(dto.investAmount)) {
      console.error('Investment amount is invalid:', dto.investAmount);
      throw new HttpException('Investment amount is invalid', HttpStatus.BAD_REQUEST);
    }

    // Check if user already purchased this plan
    const alreadyPurchased = await this.investmentModel.findOne({ user: user._id, productCode: dto.productCode });

    if (alreadyPurchased) {
      throw new HttpException('You have already purchased this product', HttpStatus.BAD_REQUEST);
    }
    
    if (user.rechargeAmount < dto.investAmount) {
      throw new HttpException('Insufficient rechargeAmount', HttpStatus.BAD_REQUEST);
    }
    
    // Deduct rechargeAmount
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
      nextPayoutDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const savedInvestment = await investment.save();

    // ✅ Add this line to trigger referral reward logic
    await this.handleReferralReward(user.userId, plan.investAmount);

    return savedInvestment;
  }

  async getOrdersByUser(userId: string): Promise<Investment[]> {
    return this.investmentModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async handleReferralReward(buyerUserId: string, productAmount: number) {
    const buyer = await this.userModel.findOne({ userId: buyerUserId });
  
    if (buyer?.invitationCode) {
      const inviter = await this.userModel.findOne({ referralCode: buyer.invitationCode });
      
      if (inviter) {
        const reward = productAmount * 0.1;
        inviter.balance += reward;
        await inviter.save();
      }
    }
  }
}
