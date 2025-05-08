import { Controller, Post, Body } from '@nestjs/common';

@Controller('qr')
export class QrController {
  @Post('generate')
  generateQr(@Body() body: { upiId: string; amount: number }) {
    const { upiId, amount } = body;
    const qrData = `upi://pay?pa=${upiId}&pn=PayNest&am=${amount}&cu=INR`;
    return { qrData };
  }
}
