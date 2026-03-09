import { Injectable } from '@nestjs/common';
import { StudentsService } from '../students/students.service';
import { CreateAttendanceDto } from '../students/dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly studentsService: StudentsService) {}

  // Tandai absensi masuk (Hadir)
  async markAttendance(nis: string, body: CreateAttendanceDto) {
    return this.studentsService.createAttendance(nis, body);
  }

  // Tandai log pulang
  async markPulang(nis: string, body: any) {
    // Diperbaiki: Memanggil 'createPulangLog' sesuai yang ada di StudentsService.
    // Kita ambil 'timestamp' dari body karena fungsi di StudentsService butuh string timestamp.
    const timestamp = body.timestamp || new Date().toISOString();
    return this.studentsService.createPulangLog(nis, timestamp);
  }

  // Reset semua data absensi
  async resetAllAttendance() {
    return this.studentsService.resetAllAttendance();
  }

  // Reset data absensi satu siswa
  async resetStudentAttendance(nis: string) {
    return this.studentsService.resetOneAttendance(nis);
  }
}