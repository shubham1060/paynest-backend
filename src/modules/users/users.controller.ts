import { Controller, Get, Post, Body, Res, HttpStatus, HttpException, Headers, UnauthorizedException, Param } from '@nestjs/common';
import { Response } from 'express';
import sendResponse from 'src/middleware/sendResponse';
import { __ } from 'i18n';
import { UsersService } from './users.service';
import { CreateUserDto } from './user.dto';
import { JwtService } from 'src/services/jwt.service';

@Controller('api/user')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
      try {
          const user = await this.usersService.createUser(createUserDto);
          console.log(createUserDto);
          const token = this.jwtService.generateToken({ id: user?._id, phoneNumber: user?.phoneNumber });
          return res.status(HttpStatus.OK).send(sendResponse(__('success.create_user'), { data: user, access_token: token  }, true));
      } catch (error) {
          const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
          return res.status(status).send(sendResponse(__('error.create_user_failed'), { error: error.message }, false));
      }
  }

  @Post('login')
    async login(@Body() loginDto: { phoneNumber: string; password: string }, @Res() res: Response) {
        try {
            const user = await this.usersService.validateUser(loginDto.phoneNumber, loginDto.password);
            const token = this.jwtService.generateToken({ id: user?._id, phoneNumber: user?.phoneNumber, userId: user?.userId});
            if (!user) {
                throw new UnauthorizedException(__('error.invalid_credentials'));
            }
            return res.status(HttpStatus.OK).send(sendResponse(__('success.logged_successfully'), { data: {...user.toObject?.(), userId: user.userId }, access_token: token }, true));
        } catch (error) {
            const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).send(sendResponse(__('error.logging_in'), { error: error.message }, false));
        }
    }

  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get('me')
  async getMyProfile(@Headers('authorization') authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('No token provided');

    const token = authHeader.replace('Bearer ', '');
    const payload = this.jwtService.decodeToken(token);

    // console.log('Received Token:==53=>', authHeader);
    console.log('Decoded Payload:==54=>', payload);

    if (!payload || !payload.id) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const user = await this.usersService.findByUserIdWithBankDetails(payload.userId);
    console.log('user==62===>', user);
    if (!user) {
      throw new HttpException(__('error.user_not_found'), HttpStatus.NOT_FOUND);
    }
    return { ...(user.toObject() || {}), bankCount: user.bankDetails?.length || 0 };
    // return this.usersService.findById(payload.id);
  }

  // @Get(':id')
  // async getUserWithBankDetails(@Param('id') id: string) {
  //   const user = await this.usersService.findByIdWithBankDetails(id);
  //   console.log('user==68===>', user);
  //   if (!user) {
  //     throw new HttpException(__('error.user_not_found'), HttpStatus.NOT_FOUND);
  //   }
  //   return { ...(user.toObject() || {}), bankCount: user.bankDetails?.length || 0 };
  // }

}
