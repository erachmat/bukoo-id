import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryBooksDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsIn(['popular', 'newest', 'rating'])
  sort?: 'popular' | 'newest' | 'rating';

  @IsOptional()
  @IsIn(['id', 'en'])
  language?: 'id' | 'en';
}
