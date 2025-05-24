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
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recharge, RechargeDocument } from '../schemas/recharge.schema';
import { User } from '../schemas/user.schema';
import { CreateRechargeDto } from '../recharge/recharge.dto';
import { RechargeService } from './recharge.service'; // Assuming you have a service for business logic

@Controller('api/recharge')
export class RechargeController {

  constructor(
    private readonly rechargeService: RechargeService,
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
  async getAllRecharge(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    try {
      const limitNum = Math.max(parseInt(limit || '15', 10), 1); // Default to 15, minimum 1
      const skipNum = Math.max(parseInt(skip || '0', 10), 0);    // Default to 0, minimum 0

      const [data, total] = await this.rechargeService.findAll(limitNum, skipNum);

      return {
        success: true,
        data,
        total,
      };
    } catch (error) {
      console.error('Error fetching recharges:', error);
      throw new InternalServerErrorException('Failed to fetch recharge data');
    }
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
