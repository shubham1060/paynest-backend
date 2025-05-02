import { Body, Controller, Get, Headers, HttpException, HttpStatus, NotFoundException, Param, Patch, Post, Res, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtService } from 'src/services/jwt.service';
import { Response } from 'express';
import sendResponse from 'src/middleware/sendResponse';
import { __ } from 'i18n';
import { Recharge, RechargeDocument } from '../schemas/recharge.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('api/admin')
export class AdminController {
  constructor(
    @InjectModel(Recharge.name)
    private readonly rechargeModel: Model<RechargeDocument>,
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) { }

  @Post('login')
  async adminLogin(@Body() loginDto: { phoneNumber: string; password: string }, @Res() res: Response) {
    // console.log('loginDto==14=>', loginDto);
    try {
      const user = await this.adminService.validateAdmin(loginDto.phoneNumber, loginDto.password);
      const token = this.jwtService.generateToken({ id: user?._id, phoneNumber: user?.phoneNumber, userId: user?.userId, isAdmin: user?.isAdmin || false });
      if (!user) {
        throw new UnauthorizedException(__('error.invalid_credentials'));
      }
      return res.status(HttpStatus.OK).send(sendResponse(__('success.logged_successfully'), { data: { ...user.toObject?.(), userId: user.userId }, access_token: token }, true));
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).send(sendResponse(__('error.logging_in'), { error: error.message }, false));
    }
  }

  @Get('dashboard')
  async getDashboardData(@Headers('authorization') authHeader: string) {
    // console.log('authHeader==23=>', authHeader);
    if (!authHeader) throw new UnauthorizedException('No token provided');

    const token = authHeader.replace('Bearer ', '');
    const payload = this.jwtService.decodeToken(token);

    if (!payload || !payload.id || !payload.isAdmin) {
      throw new UnauthorizedException('Only admin can access this route');
    }

    return this.adminService.getDashboardStats();
  }

  @Get('recharges')
  async getGroupedRecharges() {
    const allRecharges = await this.rechargeModel.aggregate([
      {
        $match: {
          utr: { $ne: null } // Only records with UTR
        }
      },
      {
        $group: {
          _id: "$utr",
          count: { $sum: 1 },
          entries: {
            $push: {
              _id: "$_id",
              userId: "$userId",
              amount: "$amount",
              upiId: "$upiId",
              status: "$status",
              createdAt: "$createdAt"
            }
          }
        }
      },
      {
        $sort: { count: -1 } // Show most common UTRs first
      }
    ]);

    return { success: true, data: allRecharges };
  }

  // ✅ Update status of a recharge by ID
  @Patch('/admin/update-status/:id')
  async updateRechargeStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const recharge = await this.rechargeModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!recharge) {
      throw new NotFoundException('Recharge not found');
    }

    return { success: true, data: recharge };
  }
}
