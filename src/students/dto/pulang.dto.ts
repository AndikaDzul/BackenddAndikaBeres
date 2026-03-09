import { IsString } from 'class-validator';

export class PulangDto {

  @IsString()
  timestamp: string;

}