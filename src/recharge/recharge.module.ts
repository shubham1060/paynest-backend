import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RechargeController } from './recharge.controller';
import { Recharge, RechargeSchema } from '../schemas/recharge.schema';
import { User, UserSchema } from '../schemas/user.schema'; 
import { RechargeService } from './recharge.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recharge.name, schema: RechargeSchema },
      { name: User.name, schema: UserSchema }, 
    ]),
  ],
  controllers: [RechargeController],
  providers: [RechargeService],
  exports: [MongooseModule],
})
export class RechargeModule {}
