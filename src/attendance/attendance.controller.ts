import { Controller, Post, Param, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from '../students/dto/create-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Menandai kehadiran siswa berdasarkan NIS.
   * @param nis Nomor Induk Siswa.
   * @param body Data kehadiran (lat, lng, deviceId, dll).
   * @returns Hasil dari pencatatan kehadiran.
   */
  @Post(':nis')
  async mark(@Param('nis') nis: string, @Body() body: CreateAttendanceDto) {
    return this.attendanceService.markAttendance(nis, body);
  }

  /**
   * Mengatur ulang (reset) semua data kehadiran siswa.
   * @returns Hasil dari proses reset massal.
   */
  @Post('reset')
  async reset() {
    return this.attendanceService.resetAllAttendance();
  }
}