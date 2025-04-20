import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommissionService } from './commission.service';
import { Investment, InvestmentSchema } from '../schemas/invest.schema';
import { Commission, CommissionSchema } from '../schemas/commission.schema';
import { UsersModule } from '../modules/users/users.module'; 
import { CommissionController } from './commission.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Investment.name, schema: InvestmentSchema },
      { name: Commission.name, schema: CommissionSchema },
    ]),
    UsersModule, 
  ],
  controllers: [CommissionController],
  providers: [CommissionService],
})
export class CommissionModule {}
