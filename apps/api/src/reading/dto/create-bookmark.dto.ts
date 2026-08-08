import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookmarkDto {
  @ApiProperty({ example: 'epubcfi(/6/4[chap01]!/4/2/1:0)' })
  @IsString()
  cfi!: string;

  @ApiPropertyOptional({ example: 'Bab 1: Pendahuluan' })
  @IsOptional()
  @IsString()
  chapterTitle?: string;

  @ApiPropertyOptional({ example: 45.5 })
  @IsOptional()
  @IsNumber()
  progress?: number;
}
