import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback } from '../schemas/feedback.schema';
import { CreateFeedbackDto } from './feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const { userId } = createFeedbackDto;

    // Get today's date starting at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user already submitted feedback today
    const existingFeedback = await this.feedbackModel.findOne({
      userId,
      createdAt: { $gte: today },
    });

    if (existingFeedback) {
      throw new BadRequestException('You can only submit feedback once per day.');
    }

    // Create new feedback
    const feedback = new this.feedbackModel(createFeedbackDto);
    return feedback.save();
  }

  async findAll(): Promise<Feedback[]> {
    return this.feedbackModel.find().sort({ createdAt: -1 });
  }
}
