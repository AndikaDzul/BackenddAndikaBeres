import { IsString, IsNumber, IsOptional, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RatingDetailDto {
  @IsString()
  statement: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}

export class CreateEvaluationDto {
  @IsString()
  studentNis: string;

  @IsString()
  teacherName: string;

  @ValidateNested()
  @Type(() => RatingDetailDto)
  discipline: RatingDetailDto;

  @ValidateNested()
  @Type(() => RatingDetailDto)
  teamwork: RatingDetailDto;

  @ValidateNested()
  @Type(() => RatingDetailDto)
  responsibility: RatingDetailDto;

  @ValidateNested()
  @Type(() => RatingDetailDto)
  initiative: RatingDetailDto;

  // --- TAMBAHKAN 3 INI AGAR TIDAK ERROR 400 ---
  @ValidateNested()
  @Type(() => RatingDetailDto)
  ethics: RatingDetailDto;

  @ValidateNested()
  @Type(() => RatingDetailDto)
  professionalism: RatingDetailDto;

  @ValidateNested()
  @Type(() => RatingDetailDto)
  persistence: RatingDetailDto;

  @IsOptional()
  @IsString()
  notes?: string;
}