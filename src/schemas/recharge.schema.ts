import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Recharge extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'success' }) // success, pending, failed
  status: string;
}

export const RechargeSchema = SchemaFactory.createForClass(Recharge);
