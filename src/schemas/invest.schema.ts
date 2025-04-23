import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvestmentDocument = Investment & Document;

@Schema({ timestamps: true })
export class Investment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  productCode: string; // e.g., "DA", "DB", "DC", EA1, EA2, EA3

  @Prop({ required: true })
  productName: string; // e.g., "Daily Income A"

  @Prop({ required: true })
  investAmount: number;

  @Prop({ required: true })
  totalEarnings: number;

  @Prop({ required: true })
  returnPeriodDays: number; // 30 or 31

  @Prop({ required: true })
  periodicReturn: number; // daily or monthly earning

  @Prop({ default: 0 })
  earningsReceived: number;

  @Prop({ default: 0 }) // times earning has been credited
  earningChancesUsed: number;

  @Prop({ required: true })
  earningChancesTotal: number; // like 30 for daily or 1 for monthly

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop()
  nextPayoutDate: Date;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
