// withdrawal-record.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WithdrawalRecordDocument = WithdrawalRecord & Document;

@Schema({ timestamps: true })
export class WithdrawalRecord {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  withdrawMoney: number;

  @Prop({ required: true })
  withdrawTax: number;

  @Prop({ required: true })
  arrivalMoney: number;

  @Prop({ required: true, enum: ['Payment Pending', 'Payment Success', 'Payment Failed'], default: 'Payment Pending' })
  status: string;

  @Prop({ required: true })
  createTime: Date;

  @Prop()
  finishTime: Date;
}

export const WithdrawalRecordSchema = SchemaFactory.createForClass(WithdrawalRecord);
