import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Investment } from '../schemas/invest.schema';
import { Withdrawal } from '../schemas/withdraw.schema';
import { Commission } from '../schemas/commission.schema';
import { Model } from 'mongoose';
import { JwtService } from '../services/jwt.service';
import { EncryptService } from '../services/encrypt.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Investment.name) private investmentModel: Model<Investment>,
    @InjectModel(Withdrawal.name) private withdrawModel: Model<Withdrawal>,
    @InjectModel(Commission.name) private commissionModel: Model<Commission>,
    private readonly jwtService: JwtService
  ) { }

  async getDashboardStats() {
    const users = await this.userModel.find({}, { userId: 1, rechargeAmount: 1, balance: 1 });
    const totalUsers = users.filter(user => !!user.userId).length;
    const totalRecharge = users.reduce((sum, u) => sum + (u.rechargeAmount || 0), 0);
    const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);

    const investments = await this.investmentModel.find({}, { productName: 1, investAmount: 1 });

    // ➕ Calculate total investment
    const totalInvestment = investments.reduce((sum, inv) => sum + (inv.investAmount || 0), 0);

    const productCounts = [
      'Daily Income A',
      'Daily Income B',
      'Daily Income C',
      'Eyes of the Future A1',
      'Eyes of the Future A2',
      'Eyes of the Future A3'
    ].reduce((acc, product) => {
      acc[product] = investments.filter(inv => inv.productName === product).length;
      return acc;
    }, {});

    const withdrawals = await this.withdrawModel.find({ status: 'Payment Pending' }, { amount: 1 });
    const totalWithdraw = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

    const commissions = await this.commissionModel.find({}, { commissionEarned: 1 });
    const totalCommission = commissions.reduce((sum, c) => sum + (c.commissionEarned || 0), 0);

    return {
      totalUsers,
      totalRecharge,
      totalBalance,
      totalInvestment, // ⬅️ added here
      totalWithdraw,
      totalCommission,
      productCounts,
    };
  }


  async validateAdmin(phoneNumber: string, password: string): Promise<User> {
    // console.log('phoneNumber==58=>', phoneNumber);
    const admin = await this.userModel.findOne({ phoneNumber }).select('+password');
    // console.log('admin==60=>', admin);
    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }

    if (!admin.isAdmin) {
      throw new HttpException('Access denied. Not an admin.', HttpStatus.FORBIDDEN);
    }

    const isPasswordValid = await EncryptService.comparePassword(password, admin.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }
    // console.log('admin==72=>', admin);
    return admin;
  }
}
