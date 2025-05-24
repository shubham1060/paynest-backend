// src/recharge/recharge.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRechargeDto } from './recharge.dto';
import { Recharge, RechargeDocument } from '../schemas/recharge.schema';

@Injectable()
export class RechargeService {
  constructor(
    @InjectModel(Recharge.name) private rechargeModel: Model<RechargeDocument>,
  ) { }

  async createRecharge(createRechargeDto: CreateRechargeDto): Promise<Recharge> {
    const newRecharge = new this.rechargeModel({
      ...createRechargeDto,
      status: 'Pending',
    });
    return await newRecharge.save();
  }

  async findAll(limit: number, skip: number): Promise<[Recharge[], number]> {
  const data = await this.rechargeModel
    .find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await this.rechargeModel.countDocuments().exec();
  // console.log('RechargeService:32 total=', total, 'data.length32=', data.length);
  return [data, total];
}
}
