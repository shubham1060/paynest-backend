// invest/invest.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvestmentController } from './invest.controller';
import { InvestmentService } from './invest.service';
import { Investment, InvestmentSchema } from '../schemas/invest.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Investment.name, schema: InvestmentSchema },
      { name: User.name, schema: UserSchema },
    ])
  ],
  controllers: [InvestmentController],
  providers: [InvestmentService],
})
export class InvestmentModule {}
