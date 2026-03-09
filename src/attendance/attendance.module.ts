// src/attendance/attendance.module.ts
import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { StudentsModule } from '../students/students.module'; // ✅ Import module siswa

@Module({
  imports: [StudentsModule], // ✅ pastikan module siswa diimport
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}