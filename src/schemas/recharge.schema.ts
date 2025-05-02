// src/recharge/schemas/recharge.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RechargeDocument = Recharge & Document;

@Schema({ timestamps: true }) // handles createdAt & updatedAt automatically
export class Recharge {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  upiId?: string;

  @Prop() 
  channel: string;

  @Prop({ default: '' })
  utr?: string;

  @Prop({
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending',
  })
  status: string;
}

export const RechargeSchema = SchemaFactory.createForClass(Recharge);
