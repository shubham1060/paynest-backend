// src/bank-details/schemas/bank-details.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BankDetailsDocument = BankDetails & Document;

@Schema({ timestamps: true })
export class BankDetails {
  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  ifsc: string;

  @Prop({ required: true })
  cardholderName: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  userId: string;
}

export const BankDetailsSchema = SchemaFactory.createForClass(BankDetails);
