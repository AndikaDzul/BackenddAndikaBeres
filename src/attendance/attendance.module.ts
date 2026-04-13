// src/attendance/attendance.module.ts
import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { StudentsModule } from '../students/students.module'; 
import { EvaluationsModule } from '../evaluations/evaluations.module'; // ✅ WAJIB DITAMBAHKAN

@Module({
  imports: [
    StudentsModule, 
    EvaluationsModule // ✅ Tambahkan ini agar dependensi StudentsService terpenuhi
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}