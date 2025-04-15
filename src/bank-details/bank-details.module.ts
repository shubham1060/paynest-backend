// src/bank-details/bank-details.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankDetails, BankDetailsSchema } from '../schemas/bank-details.schema';
import { BankDetailsService } from './bank-details.service';
import { BankDetailsController } from './bank-details.controller';
import { JwtService } from 'src/services/jwt.service';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BankDetails.name, schema: BankDetailsSchema }]), UsersModule
  ],
  controllers: [BankDetailsController],
  providers: [BankDetailsService, JwtService],
})
export class BankDetailsModule {}
