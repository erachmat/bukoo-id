import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Alamat email tidak valid' })
  email!: string;
}
