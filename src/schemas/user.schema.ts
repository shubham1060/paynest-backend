import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EncryptService } from 'src/services/encrypt.service';
import { BankDetails } from './bank-details.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  invitationCode?: string;

  @Prop({ unique: true })
  userId: string; // like "40109939"

  @Prop({ default: 0 })
  rechargeAmount: number;

  @Prop({ default: 0 })
  balance: number;

  @Prop()
  email: string;

  @Prop({ unique: true })
  referralCode: string;

  @Prop({ type: Boolean, default: false })
  isAdmin: boolean;

  @Prop({ default: false })
  rewardPopupShown: boolean;

  @Prop({
    type: {
      isLinked: { type: Boolean, default: false },
      bankName: String,
      accountNumber: String,
      ifsc: String,
    },
    default: {}
  })
  bankAccount: {
    isLinked: boolean;
    bankName: string;
    accountNumber: string;
    ifsc: string;
  };

  createdAt: Date;
  updatedAt: Date;

  bankDetails: BankDetails[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

UserSchema.virtual('bankDetails', {
  ref: 'BankDetails',
  localField: 'userId',     // <-- this is the string userId like "4000008"
  foreignField: 'userId',   // <-- also string in BankDetails
});

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await EncryptService.encryptPassword(this.password);
    next();
  } catch (err) {
    next(err);
  }
});



