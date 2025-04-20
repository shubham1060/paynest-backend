import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvestmentDocument = Investment & Document;

@Schema({ timestamps: true })
export class Investment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop()
  userId: string;

  @Prop({ required: true })
  productCode: string; // e.g., "DA", "DB", "DC", EA1, EA2, EA3

  @Prop()
  productName: string; // e.g., "Daily Income A"

  @Prop({ required: true })
  investAmount: number;

  @Prop()
  totalEarnings: number;

  @Prop()
  returnPeriod: string; // 30 or 31

  @Prop()
  periodicReturn: number; // daily or monthly earning

  @Prop()
  earningsReceived: number;

  @Prop({ default: 0 }) // times earning has been credited
  earningChancesUsed: number;

  @Prop()
  earningChancesTotal: number; // like 30 for daily or 1 for monthly

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop()
  nextPayoutDate: Date;

  createdAt: Date;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
