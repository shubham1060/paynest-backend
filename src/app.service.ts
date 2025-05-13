import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello PayNest, Your Backend is Runing...!';
  }
}
