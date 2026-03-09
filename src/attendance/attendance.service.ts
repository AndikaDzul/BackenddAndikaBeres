import { Injectable } from '@nestjs/common';
import { StudentsService } from '../students/students.service';
import { CreateAttendanceDto } from '../students/dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly studentsService: StudentsService) {}

  // Tandai absensi siswa
  async markAttendance(nis: string, body: CreateAttendanceDto) {
    return this.studentsService.createAttendance(nis, body);
  }

  // Reset semua absensi siswa
  async resetAllAttendance() {
    return this.studentsService.resetAllAttendance();
  }

  // Reset absensi 1 siswa (opsional, bisa dipanggil dari controller)
  async resetStudentAttendance(nis: string) {
    return this.studentsService.resetOneAttendance(nis);
  }
}