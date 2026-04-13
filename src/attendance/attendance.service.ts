import { Injectable } from '@nestjs/common';
import { StudentsService } from '../students/students.service';
import { CreateAttendanceDto } from '../students/dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * Memanggil service siswa untuk mencatat kehadiran.
   * @param nis Nomor Induk Siswa.
   * @param body Data DTO kehadiran.
   * @returns Hasil dari StudentsService.
   */
  async markAttendance(nis: string, body: CreateAttendanceDto) {
    return this.studentsService.createAttendance(nis, body);
  }

  /**
   * Memanggil service siswa untuk mereset semua data kehadiran.
   * @returns Hasil dari StudentsService.
   */
  async resetAllAttendance() {
    return this.studentsService.resetAllAttendance();
  }

  /**
   * Memanggil service siswa untuk mereset kehadiran satu siswa tertentu.
   * @param nis Nomor Induk Siswa.
   * @returns Hasil dari StudentsService.
   */
  async resetStudentAttendance(nis: string) {
    return this.studentsService.resetOneAttendance(nis);
  }
}