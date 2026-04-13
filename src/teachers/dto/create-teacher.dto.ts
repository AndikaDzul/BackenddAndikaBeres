import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  mapel: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
