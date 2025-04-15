// withdrawals.module.ts
import { Module } from '@nestjs/common';
import { WithdrawalController } from './withdraw.controller';
import { WithdrawalsService } from './withdraw.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Withdrawal, WithdrawalSchema } from '../schemas/withdraw.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Withdrawal', schema: WithdrawalSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalsService],
})
export class WithdrawalsModule {}
