import { IsNumber, IsString, Min, Max } from 'class-validator';

export class UpdateProgressDto {
  @IsNumber()
  @Min(1)
  currentPage!: number;

  @IsString()
  cfiPosition!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent!: number;

  @IsNumber()
  @Min(0)
  reading_time_delta!: number;
}
