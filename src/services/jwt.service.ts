import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JWT_EXPIRY } from 'src/constant/time.const';

@Injectable()
export class JwtService {


  /**
   *
   * @param payload
   * @returns
   */
  generateToken(payload: any): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRY });
  }

  /**
   *
   * @param token
   * @returns
   */
  decodeToken(token: string): any {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

}
