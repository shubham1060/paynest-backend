// src/razorpay/razorpay.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';

@Controller('api/razorpay')
export class RazorpayController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Post('create-order')
  async createOrder(@Body('amount') amount: number) {
    return this.razorpayService.createOrder(amount);
  }
}
