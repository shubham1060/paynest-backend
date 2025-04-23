import { Injectable } from '@nestjs/common';

const Razorpay = require('razorpay');
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private razorpay: any;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }


  async createOrder(amount: number, currency = 'INR') {
    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency,
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: 1,
    };

    console.log('options=25==>',options);

    return await this.razorpay.orders.create(options);
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error('RAZORPAY_KEY_SECRET is not defined in the environment variables');
    }
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    console.log('expectedSignature==42=>',expectedSignature);  

    return expectedSignature === signature;
  }
}
