import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Commission extends Document {
  @Prop({ required: true })
  inviterUserId: string;

  @Prop({ required: true })
  childUserId: string;

  @Prop({ required: true })
  investAmount: number;

  @Prop({ required: true })
  commissionEarned: number;

  @Prop({ required: true })
  product: string;

  @Prop({ enum: ['Pending', 'Credited', 'Failed'], default: 'Pending' })
  status: string;

  createdAt: Date;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);
