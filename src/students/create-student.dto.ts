import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  nis: string

  @IsOptional()
  @IsString()
  email?: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsOptional()
  @IsString()
  class?: string

  // Tambahan Field Baru
  @IsNotEmpty()
  @IsString()
  grade: string // X, XI, XII

  @IsNotEmpty()
  @IsString()
  major: string // RPL, AKL, dll

  @IsNotEmpty()
  @IsString()
  classNumber: string // 1, 2, 3
}