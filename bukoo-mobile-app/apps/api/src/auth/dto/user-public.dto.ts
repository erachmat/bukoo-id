import { IsString, IsEmail, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class UserPublicDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  avatarUrl!: string | null;

  @IsString()
  subscriptionTier!: string;

  @IsBoolean()
  onboardingCompleted!: boolean;

  @IsDateString()
  createdAt!: string;
}
