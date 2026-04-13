// src/students/students.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student, StudentSchema } from './schemas/student.schema';
import { EvaluationsModule } from '../evaluations/evaluations.module'; // ✅ Import ini

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
    EvaluationsModule, // ✅ Hubungkan dengan modul penilaian
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService], // ✅ Export agar bisa dipakai AttendanceService
})
export class StudentsModule {}