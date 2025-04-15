import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto } from './user.dto';
import { EncryptService } from 'src/services/encrypt.service';
import { JwtService } from 'src/services/jwt.service';

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

      // Create new user with bankAccount and userId
      const newUser = new this.userModel({
        name: dto.name,
        phoneNumber: dto.phoneNumber,
        password: dto.password,
        invitationCode: dto.invitationCode,
        userId: nextUserId,
        balance: 0,
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
      const user = await this.userModel.findOne({ phoneNumber }).select('+password').lean();
      if (!user) {
        throw new HttpException('user not found', HttpStatus.NOT_FOUND);
      }
      const isPasswordValid = await EncryptService.comparePassword(password, user.password);
      console.log('isPasswordValid==57==>', isPasswordValid);
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
  
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
