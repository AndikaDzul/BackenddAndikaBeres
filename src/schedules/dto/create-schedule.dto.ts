import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  hari: string;

  @IsString()
  @IsNotEmpty()
  jam: string;

  @IsString()
  @IsNotEmpty()
  kelas: string;

  @IsString()
  @IsNotEmpty()
  mapel: string;

  @IsString()
  @IsOptional()
  guru: string;
}
