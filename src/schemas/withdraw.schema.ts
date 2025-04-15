// src/modules/withdrawals/schemas/withdrawal.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WithdrawalDocument = Withdrawal & Document;

@Schema({ timestamps: true })
export class Withdrawal extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  bankAccountId: string;

  @Prop()
  arrivalMoney: number;

  @Prop()
  withdrawTax: number;

//  arrivalMoney = amount; 

  @Prop({ required: true, enum: ['Payment Pending', 'Payment Success', 'Payment Failed'], default: 'Payment Pending' })
  status: string;

  createdAt: Date;
  updatedAt: Date;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);
