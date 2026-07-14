import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Alamat email tidak valid' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Kode verifikasi wajib diisi' })
  token!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password baru wajib diisi' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  newPassword!: string;
}
