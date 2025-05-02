import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  NotFoundException,
  Get,
  Param,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recharge, RechargeDocument } from '../schemas/recharge.schema';
import { User } from '../schemas/user.schema';
import { CreateRechargeDto } from '../recharge/recharge.dto';

@Controller('api/recharge')
export class RechargeController {
  constructor(
    @InjectModel(Recharge.name) private rechargeModel: Model<RechargeDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  @Post('submit')
  async createRecharge(@Body() dto: CreateRechargeDto) {
    const user = await this.userModel.findOne({ userId: dto.userId }); // Use custom userId

    if (!user) throw new NotFoundException('User not found');

    const recharge = await this.rechargeModel.create({
      userId: dto.userId, // Store custom userId
      amount: dto.amount,
      upiId: dto.upiId,
      utr: dto.utr,
      status: 'Pending',
    });

    return { success: true, data: recharge };
  }

  @Get('getRechargeDetails/:userId')
  async getRechargeDetails(@Param('userId') userId: string) {
    const user = await this.userModel.findOne({ userId: userId });
    if (!user) throw new NotFoundException('User not found');

    const records = await this.rechargeModel
      .find({ userId: user.userId })
      .sort({ createdAt: -1 });

    return { success: true, data: records };
  }

  @Get('all')
  async getAllRecharges() {
    const all = await this.rechargeModel.find().sort({ createdAt: -1 });
    // console.log('all recharge=56=>', all);
    return { success: true, data: all };
  }

  @Patch('status/:id')
  async updateRechargeStatus(
    @Param('id') rechargeId: string,
    @Body() body: { status: 'Success' | 'Failed' },
  ) {
    const recharge = await this.rechargeModel.findById(rechargeId);
    if (!recharge) throw new NotFoundException('Recharge not found');

    if (recharge.status !== 'Pending') {
      throw new BadRequestException('Recharge already processed');
    }

    recharge.status = body.status;
    await recharge.save();

    if (body.status === 'Success') {
      const updatedUser = await this.userModel.findOneAndUpdate(
        { userId: recharge.userId },
        { $inc: { rechargeAmount: recharge.amount } },
        { new: true }
      );

      if (!updatedUser) {
        throw new NotFoundException('User not found or balance update failed');
      }

      // console.log('User updated:', updatedUser);
    }

    return { success: true, message: 'Recharge updated successfully' };
  }
}
