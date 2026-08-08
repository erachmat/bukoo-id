import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHighlightDto {
  @ApiProperty({ example: 'epubcfi(/6/4[chap01]!/4/2/1:0)' })
  @IsString()
  cfiRange!: string;

  @ApiProperty({ example: 'Selected text snippet from book' })
  @IsString()
  text!: string;

  @ApiPropertyOptional({ example: 'rgba(250,204,21,0.4)' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'My personal reading note' })
  @IsOptional()
  @IsString()
  note?: string;
}
