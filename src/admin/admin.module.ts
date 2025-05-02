import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { User, UserSchema } from '../schemas/user.schema';
import { Investment, InvestmentSchema } from '../schemas/invest.schema';
import { Withdrawal, WithdrawalSchema } from '../schemas/withdraw.schema';
import { Commission, CommissionSchema } from '../schemas/commission.schema';
import { ServicesModule } from 'src/services/services.module'; // ✅ already correct
import { RechargeModule } from '../recharge/recharge.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Investment.name, schema: InvestmentSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: Commission.name, schema: CommissionSchema },
    ]),
    RechargeModule,
    ServicesModule, // ✅ Add this to make JwtService available
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
