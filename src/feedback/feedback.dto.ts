import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  feedback: string;
}
