import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { InvestmentModule } from './invest/invest.module';
import { BankModule } from './bank/bank.module';
import { BankDetailsModule } from './bank-details/bank-details.module';
import { WithdrawalsModule } from './withdraw/withdraw.module';
import { CommissionModule } from './commission/commission.module';
import { FeedbackModule } from './feedback/feedback.module';
import { RechargeModule } from './recharge/recharge.module';
import { AdminModule } from './admin/admin.module';
import { QrModule } from './qr/qr.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // loads .env file and populates process.env
    MongooseModule.forRoot(process.env.MONGO_URI!), // connect to MongoDB Atlas
    UsersModule,
    InvestmentModule,
    BankModule,
    BankDetailsModule,
    WithdrawalsModule,
    CommissionModule,
    FeedbackModule,
    RechargeModule,
    AdminModule,
    QrModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// console.log("process.env.MONGO_URI",process.env.MONGO_URI!);
