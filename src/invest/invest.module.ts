// invest/invest.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvestmentController } from './invest.controller';
import { InvestmentService } from './invest.service';
import { Investment, InvestmentSchema } from '../schemas/invest.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { EarningRecord, EarningRecordSchema } from '../schemas/earning-record.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Investment.name, schema: InvestmentSchema },
      { name: User.name, schema: UserSchema },
      { name: EarningRecord.name, schema: EarningRecordSchema },
    ])
  ],
  controllers: [InvestmentController],
  providers: [InvestmentService],
})
export class InvestmentModule {}
