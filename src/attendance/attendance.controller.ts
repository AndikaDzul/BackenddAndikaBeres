import { Controller, Post, Param, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from '../students/dto/create-attendance.dto';

// Ubah menjadi 'students/attendance' agar sesuai dengan frontend:
// ${backendUrl}/students/attendance/${student.value.nis}
@Controller('students/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Endpoint: POST /api/students/attendance/:nis
  @Post(':nis')
  async mark(@Param('nis') nis: string, @Body() body: CreateAttendanceDto) {
    return this.attendanceService.markAttendance(nis, body);
  }

  // Endpoint: POST /api/students/attendance/pulang/:nis (Untuk fitur log pulang)
  @Post('pulang/:nis')
  async markPulang(@Param('nis') nis: string, @Body() body: any) {
    // Menambahkan logika pulang agar sinkron dengan frontend
    return this.attendanceService.markPulang(nis, body);
  }

  @Post('reset')
  async reset() {
    return this.attendanceService.resetAllAttendance();
  }
}