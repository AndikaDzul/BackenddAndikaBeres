import { Controller, Post, Param, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from '../students/dto/create-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post(':nis')
  async mark(@Param('nis') nis: string, @Body() body: CreateAttendanceDto) {
    return this.attendanceService.markAttendance(nis, body);
  }

  @Post('reset')
  async reset() {
    return this.attendanceService.resetAllAttendance();
  }
}