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
}