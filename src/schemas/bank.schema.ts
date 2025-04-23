import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BankDocument = Bank & Document;

@Schema()
export class Bank {
  @Prop({ required: true })
  name: string;
}

export const BankSchema = SchemaFactory.createForClass(Bank);