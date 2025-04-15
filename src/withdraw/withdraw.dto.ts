import { IsNotEmpty, IsString } from 'class-validator';

export class WithdrawDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    bankAccountId: string;
}