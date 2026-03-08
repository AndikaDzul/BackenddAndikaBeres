import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Student, StudentDocument, Attendance } from './students.schema';
import { CreateStudentDto } from './dto/create-students.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const input = dto as any;
    const grade = input.grade || '';
    const major = input.major || '';
    const classNumber = input.classNumber || '';
    const combinedClass = dto.class || `${grade} ${major} ${classNumber}`.trim();

    const student = new this.studentModel({
      nis: dto.nis,
      name: dto.name,
      class: combinedClass,
      grade: grade,
      major: major,
      classNumber: classNumber,
      password: hashedPassword,
      status: 'Belum Absen',
      attendanceHistory: [],
    });

    return student.save();
  }

  async findAll(): Promise<Student[]> {
    return this.studentModel.find().exec();
  }

  async findOne(nis: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new Error('Siswa tidak ditemukan');
    return student;
  }

  async login(nis: string, password: string): Promise<Omit<Student, 'password'> | null> {
    const studentDoc = await this.studentModel.findOne({ nis }).exec();
    if (!studentDoc) return null;
    const student = studentDoc.toObject() as Student & { password: string };
    const match = await bcrypt.compare(password, student.password);
    if (!match) return null;
    const { password: pwd, ...result } = student;
    return result;
  }

  async createAttendance(nis: string, body: CreateAttendanceDto): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new Error('Siswa tidak ditemukan');

    const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();
    const attendance: Attendance = {
      status: body.status || 'Hadir',
      timestamp,
      method: body.method || 'QR Scan',
      mapel: body.mapel,
      jam: body.jam,
      day: body.day,
      kelas: student.class,
    };

    if (!student.attendanceHistory) student.attendanceHistory = [];
    student.attendanceHistory.push(attendance);
    student.status = attendance.status;

    return student.save();
  }

  // ================= VERSI FIX: SIMPAN PATH BUKTI & UPDATE STATUS =================
  async saveEvidencePath(nis: string, filePath: string) {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new Error('Siswa tidak ditemukan');

    if (student.attendanceHistory && student.attendanceHistory.length > 0) {
      const lastIndex = student.attendanceHistory.length - 1;
      
      // Menyeragamkan format path
      const formattedPath = filePath.replace(/\\/g, '/');
      
      // Mengisi field evidencePath (Sudah terdaftar di Schema sekarang)
      student.attendanceHistory[lastIndex].evidencePath = formattedPath;
      
      // Update status utama
      student.status = 'Hadir (Bukti Terkirim)';

      // Memberitahu Mongoose bahwa array attendanceHistory berubah
      student.markModified('attendanceHistory');
      
      await student.save();
      
      return { 
        success: true, 
        message: 'Bukti berhasil disimpan di database',
        status: student.status,
        path: formattedPath 
      };
    } else {
      throw new Error('Siswa harus melakukan scan QR terlebih dahulu sebelum upload bukti.');
    }
  }

  async updateManual(nis: string, status: string, teacherName: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new Error('Siswa tidak ditemukan');

    const attendance: Attendance = {
      status: status,
      timestamp: new Date(),
      method: `Manual by ${teacherName}`,
      mapel: 'Input Manual',
      day: new Date().toLocaleDateString('id-ID', { weekday: 'long' }),
      kelas: student.class,
    };

    if (!student.attendanceHistory) student.attendanceHistory = [];
    student.attendanceHistory.push(attendance);
    student.status = status;

    return student.save();
  }

  async resetAllAttendance(): Promise<Student[]> {
    await this.studentModel.updateMany(
      {},
      { $set: { status: 'Belum Absen', attendanceHistory: [] } },
    );
    return this.findAll();
  }

  async resetOneAttendance(nis: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new Error('Siswa tidak ditemukan');
    student.status = 'Belum Absen';
    student.attendanceHistory = [];
    return student.save();
  }

  async remove(nis: string): Promise<{ message: string }> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new Error('Siswa tidak ditemukan');
    await this.studentModel.deleteOne({ nis }).exec();
    return { message: 'Siswa berhasil dihapus' };
  }
}