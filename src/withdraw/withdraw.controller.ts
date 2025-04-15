import { Controller, Post, Body, UseGuards, HttpException, HttpStatus, Get, Param } from '@nestjs/common';
import { WithdrawalsService } from './withdraw.service';
import { WithdrawDto } from './withdraw.dto';

@Controller('api/withdraw')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalsService) {}

  @Post()
  async withdraw(@Body() body: WithdrawDto) {
    try {
      const result = await this.withdrawalService.processWithdrawal(body);
      return {
        success: true,
        message: 'Withdrawal successful',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Withdrawal failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

    @Get('records/:userId')
    async getWithdrawals(@Param('userId') userId: string) {
      try {
        const records = await this.withdrawalService.getWithdrawalRecordsByUserId(userId);
        return {
          success: true,
          data: records
        };
      } catch (error) {
        throw new HttpException( error.message || 'Failed to fetch withdrawals', HttpStatus.INTERNAL_SERVER_ERROR,);
      }
    }

}
