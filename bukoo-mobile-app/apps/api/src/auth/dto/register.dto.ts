import { IsString, IsEmail, MinLength, MaxLength, IsBoolean, Equals, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(80, { message: 'Name must not exceed 80 characters' })
  name!: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one uppercase letter and one number',
  })
  password!: string;

  @IsBoolean()
  @Equals(true, { message: 'You must agree to the Terms of Service' })
  agreeToS!: boolean;
}
