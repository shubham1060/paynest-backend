// src/bank-details/bank-details.controller.ts
import { Body, Controller, Get, Param, Post, Headers, UnauthorizedException } from '@nestjs/common';
import { BankDetailsService } from './bank-details.service';
import { CreateBankDetailsDto } from './bank-details.dto';
import { JwtService } from 'src/services/jwt.service';
import { UsersService } from '../modules/users/users.service';

@Controller('api/bank-details')
export class BankDetailsController {
  
  constructor(private readonly bankDetailsService: BankDetailsService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  @Post()
  async create(@Body() createDto: CreateBankDetailsDto) {
    return this.bankDetailsService.create(createDto);
  }

  @Get('user/:userId')
  async getBankDetails(@Param('userId') userId: string) {
    const details = await this.bankDetailsService.getBankDetailsByUserId(userId);
    return {
      success: true,
      data: details,
    };
  }

  @Get()
  async getAllBankDetails() {
    const data = await this.bankDetailsService.findAll();
    // console.log('all data=33=>', data);
    return { success: true, data };
  }

  @Get('my-bank-details')
  async getMyBankDetails(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const decoded = this.jwtService.decodeToken(token);
    // console.log('Decoded token:==40==>', decoded); // Debugging line
    if (!decoded || !decoded.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = decoded.userId;
    // console.log('User ID:==46==>', userId); // Debugging line

    const bankDetails = await this.bankDetailsService.getBankDetailsByUserId(userId);
    const user = await this.userService.findOne({ userId });
    return {
      success: true,
      data: bankDetails,
      balance: user?.balance || 0,
    };
  }
}
