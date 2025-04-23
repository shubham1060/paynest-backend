import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { RazorpayController } from './razorpay.controller';
import { Recharge, RechargeSchema } from '../schemas/recharge.schema';

@Module({
  providers: [RazorpayService],
  controllers: [RazorpayController],
  exports: [RazorpayService], // important if used in other modules
})
export class RazorpayModule {}
