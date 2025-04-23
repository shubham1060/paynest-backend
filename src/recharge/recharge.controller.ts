import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  NotFoundException,
  Get,
  Param,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recharge } from '../schemas/recharge.schema';
import { User } from '../schemas/user.schema'; // Update the path as needed
import { RazorpayService } from '../razorpay/razorpay.service'; // Update path as needed

@Controller('api/recharge')
export class RechargeController {
  constructor(
    @InjectModel(Recharge.name) private rechargeModel: Model<Recharge>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly razorpayService: RazorpayService,
  ) { }

  @Post('verify-payment')
  async verifyPayment(@Body() body: any) {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      userId,
    } = body;

    let isValid = false;
    try {
      isValid = this.razorpayService.verifySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      );
    } catch (err) {
      throw new UnauthorizedException('Error verifying Razorpay signature');
    }

    const user = await this.userModel.findOne({ userId: body.userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.rechargeModel.create({
      userId: user.userId, // MongoDB ObjectId
      amount: body.amount,
      status: 'success',
      // ... other fields
    });

    await this.userModel.updateOne(
      { userId: user.userId }, // or use { userId: body.userId } if you prefer
      { $inc: { rechargeAmount: body.amount } } // increment rechargeAmount by amount
    );

    return { success: true, message: 'Recharge successful' };
  }

  @Get('getRechargeDetails/:userId')
  async getRechargeDetails(@Param('userId') userId: string) {
    const user = await this.userModel.findOne({ userId });
    if (!user) throw new NotFoundException('User not found');

    const records = await this.rechargeModel.find({ userId: user.userId }).sort({ createdAt: -1 });

    return { success: true, data: records };
  }
}
