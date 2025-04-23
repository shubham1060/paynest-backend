import { Module } from '@nestjs/common';
import { RechargeController } from './recharge.controller';
// import { RechargeService } from './recharge.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Recharge, RechargeSchema } from '../schemas/recharge.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { RazorpayService } from '../razorpay/razorpay.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recharge.name, schema: RechargeSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RechargeController],
  providers: [RazorpayService],
})
export class RechargeModule {}
