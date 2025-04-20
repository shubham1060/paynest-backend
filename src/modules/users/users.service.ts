import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto } from './user.dto';
import { EncryptService } from 'src/services/encrypt.service';
import { JwtService } from 'src/services/jwt.service';

const generatedCodes = new Set();

function generateReferralCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  let code: unknown;

  do {
    const letterPart: string[] = [];
    const digitPart: string[] = [];

    // Generate 3 random letters
    for (let i = 0; i < 3; i++) {
      letterPart.push(letters.charAt(Math.floor(Math.random() * letters.length)));
    }

    // Generate 2 random digits
    for (let i = 0; i < 2; i++) {
      digitPart.push(digits.charAt(Math.floor(Math.random() * digits.length)));
    }

    // Combine and shuffle
    const combined = [...letterPart, ...digitPart];
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]]; // Shuffle
    }

    code = combined.join('');
  } while (generatedCodes.has(code));

  generatedCodes.add(code);
  console.log('referralcode=43=>', code);
  return code;
}

@Injectable()
export class UsersService {
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password'); // Exclude password
  }
  
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({ phoneNumber: dto.phoneNumber });
      if (existingUser) {
        throw new HttpException('Phone number already registered', HttpStatus.CONFLICT);
      }

      // Generate next userId
      const lastUser = await this.userModel.findOne().sort({ userId: -1 });
      const nextUserId = lastUser?.userId ? (parseInt(lastUser.userId) + 1).toString() : '4000001';

      const referralCode  = generateReferralCode();
      console.log('invitationCode==43==>', referralCode);
      // Create new user with bankAccount and userId
      const newUser = new this.userModel({
        name: dto.name,
        phoneNumber: dto.phoneNumber,
        password: dto.password,
        invitationCode: dto.invitationCode,
        userId: nextUserId,
        balance: 0,
        referralCode,
        bankAccount: {
          isLinked: false,
          bankName: '',
          accountNumber: '',
          ifsc: '',
        },
      });
      console.log('newUser=40===>', newUser);
      return newUser.save();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Internal Server Error', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateUser(phoneNumber: string, password: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ phoneNumber }).select('+password');
      if (!user) {
        throw new HttpException('user not found', HttpStatus.NOT_FOUND);
      }
      const isPasswordValid = await EncryptService.comparePassword(password, user.password);
      console.log('isPasswordValid==64==>', isPasswordValid);
      if (!isPasswordValid) {
        throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || "Internal Server Error", error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(query: Partial<UserDocument>) {
    return this.userModel.findOne(query as FilterQuery<User>);
  }

  async findByUserIdWithBankDetails(userId: string): Promise<User> {
    const user = await this.userModel.findOne({ userId }).populate('bankDetails').exec();
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async updateUserProfile(userId: string, updateData: Partial<User>): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate({ userId: userId }, updateData, { new: true });
    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return updatedUser;
  }

  async resetPasswordWithPhone(phoneNumber: string, newPassword: string) {
    const user = await this.userModel.findOne({ phoneNumber });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.password = newPassword;
    await user.save();
  
    return { message: 'Password reset successful' };
  }
  
  
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}