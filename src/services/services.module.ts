import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service'; // Adjust path if needed

@Module({
  providers: [JwtService],
  exports: [JwtService],
})
export class ServicesModule {}
