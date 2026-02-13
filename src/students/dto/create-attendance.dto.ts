import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  nis?: string;

  @IsString()
  @IsOptional()
  teacherName?: string; 

  @IsString()
  @IsOptional()
  method?: string;

  @IsString()
  @IsOptional()
  mapel?: string;

  @IsString()
  @IsOptional()
  timestamp?: string;

  @IsOptional()
  jam?: string;

  @IsOptional()
  day?: string;
}