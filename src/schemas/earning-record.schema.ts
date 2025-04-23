// earning-record.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EarningRecordDocument = EarningRecord & Document;

@Schema({ timestamps: true })
export class EarningRecord {
  @Prop({ type: Types.ObjectId, ref: 'Investment', required: true })
  investment: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  payoutDate: Date;

  @Prop({ default: false })
  isSent: boolean;
}

export const EarningRecordSchema = SchemaFactory.createForClass(EarningRecord);
