import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Investment } from '../schemas/invest.schema';
import { Commission } from '../schemas/commission.schema';

@Injectable()
export class CommissionService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Investment.name) private investmentModel: Model<Investment>,
    @InjectModel(Commission.name) private commissionModel: Model<Commission>,
  ) { }

  async getCommissionByUser(input: { userId?: string; phoneNumber?: string }) {
    const { userId, phoneNumber } = input;

    // 1. Find the inviter
    const inviter = await this.userModel.findOne({
      ...(userId ? { userId } : {}),
      ...(phoneNumber ? { phoneNumber } : {}),
    });

    if (!inviter) {
      throw new NotFoundException('User not found');
    }

    // 2. Get all users invited by this inviter
    const children = await this.userModel.find({
      invitationCode: inviter.referralCode,
    });

    const childUserIds = children.map((child) => child.userId);

    // 3. Get their investments (which can include multiple products)
    const childInvestments = await this.investmentModel.find({
      userId: { $in: childUserIds },
    });

    // 4. For each investment, create a commission and credit if it doesn't exist
    for (const investment of childInvestments) {
      const exists = await this.commissionModel.findOne({
        inviterUserId: inviter.userId,
        childUserId: investment.userId,
        product: investment.productName,
      });

      if (!exists) {
        const commissionEarned = parseFloat((investment.investAmount * 0.1).toFixed(2));

        // 4.1 Create the commission with status "Credited"
        await this.commissionModel.create({
          inviterUserId: inviter.userId,
          childUserId: investment.userId,
          investAmount: investment.investAmount,
          commissionEarned,
          product: investment.productName,
          date: investment.createdAt,
          status: 'Credited',
        });

        // 4.2 Update inviter's balance
        await this.userModel.updateOne(
          { userId: inviter.userId },
          { $inc: { balance: commissionEarned } }
        );
      }
    }
    
    // 5. Return commission records from DB
    const commissions = await this.commissionModel
      .find({ inviterUserId: inviter.userId })
      .sort({ createdAt: -1 });

    const totalCommission = parseFloat(
      commissions.reduce((sum, record) => sum + record.commissionEarned, 0).toFixed(2)
    );

    return {
      userId: inviter.userId,
      referralCode: inviter.referralCode,
      referralCount: children.length,
      totalCommission,
      commissionRecords: commissions,
    };
  }
}
