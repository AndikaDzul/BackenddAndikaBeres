import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ================= CREATE SISWA =================
  async create(dto: CreateStudentDto): Promise<Student> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const student = new this.studentModel({
      nis: dto.nis,
      name: dto.name,
      class: dto.class,
      password: hashedPassword,
      status: 'Belum Absen',
      attendanceHistory: [],
    });
    return student.save();
  }

  // ================= GET ALL SISWA =================
  async findAll(): Promise<Student[]> {
    return this.studentModel.find().exec();
  }

  // ================= GET ONE SISWA =================
  async findOne(nis: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');
    return student;
  }

  // ================= LOGIN SISWA =================
  async login(nis: string, password: string): Promise<Omit<Student, 'password'> | null> {
    const studentDoc = await this.studentModel.findOne({ nis }).exec();
    if (!studentDoc) return null;
    const student = studentDoc.toObject() as any;
    const match = await bcrypt.compare(password, student.password);
    if (!match) return null;
    const { password: pwd, ...result } = student;
    return result;
  }

  // ================= ABSENSI SCAN QR (SISWA) =================
  async createAttendance(nis: string, body: CreateAttendanceDto): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();
    
    const attendance: any = {
      status: body.status || 'Hadir',
      timestamp,
      method: body.method || 'QR Scan',
      mapel: body.mapel || 'Pelajaran Umum',
      jam: timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      day: timestamp.toLocaleDateString('id-ID', { weekday: 'long' }),
    };

    if (!student.attendanceHistory) student.attendanceHistory = [];
    student.attendanceHistory.push(attendance);
    student.status = attendance.status;

    return student.save();
  }

  // ================= LOGIKA PULANG (NEW) =================
  async createPulangLog(nis: string, timestampStr: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const timestamp = timestampStr ? new Date(timestampStr) : new Date();
    
    const attendance: any = {
      status: 'Pulang',
      timestamp: timestamp,
      method: 'Siswa Self-Log',
      mapel: 'Selesai KBM',
      jam: timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      day: timestamp.toLocaleDateString('id-ID', { weekday: 'long' }),
    };

    if (!student.attendanceHistory) student.attendanceHistory = [];
    student.attendanceHistory.push(attendance);
    
    student.status = 'Pulang';
    // Otomatis simpan jam sekarang agar muncul di profil
    student.lastPulang = timestamp;

    return student.save();
  }

  // ================= UPDATE MANUAL (GURU) =================
  async updateManual(nis: string, status: string, teacherName: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const now = new Date();
    const attendance: any = {
      status: status,
      timestamp: now,
      method: `Manual by ${teacherName}`,
      mapel: 'Input Manual',
      day: now.toLocaleDateString('id-ID', { weekday: 'long' }),
    };

    if (!student.attendanceHistory) student.attendanceHistory = [];
    student.attendanceHistory.push(attendance);
    student.status = status;

    return student.save();
  }

  // ================= RESET SEMUA ABSENSI =================
  async resetAllAttendance(): Promise<Student[]> {
    await this.studentModel.updateMany(
      {},
      { $set: { status: 'Belum Absen', attendanceHistory: [], lastPulang: null } },
    );
    return this.findAll();
  }

  // ================= RESET 1 SISWA =================
  async resetOneAttendance(nis: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');
    
    student.status = 'Belum Absen';
    student.attendanceHistory = [];
    // Casting ke any agar mengizinkan null saat reset
    (student as any).lastPulang = null;
    
    return student.save();
  }

  // ================= DELETE SISWA =================
  async remove(nis: string): Promise<{ message: string }> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');
    await this.studentModel.deleteOne({ nis }).exec();
    return { message: 'Siswa berhasil dihapus' };
  }
}