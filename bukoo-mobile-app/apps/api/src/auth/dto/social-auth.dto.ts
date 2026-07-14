import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class SocialAuthDto {
  @IsIn(['google', 'apple'], { message: 'Provider must be either google or apple' })
  provider!: 'google' | 'apple';

  @IsString()
  @IsNotEmpty({ message: 'ID Token is required' })
  idToken!: string;

  @IsString()
  @IsNotEmpty({ message: 'Device ID is required' })
  deviceId!: string;
}
