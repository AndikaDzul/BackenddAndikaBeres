import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { Student, StudentDocument } from './schemas/student.schema';
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

  // ================= ABSENSI QR =================
  async createAttendance(nis: string, body: CreateAttendanceDto): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();
    const attendance: any = {
      status: body.status || 'Hadir',
      timestamp,
      method: body.method || 'QR Scan',
      qrToken: body.qrToken,
      mapel: body.mapel || 'Pelajaran Umum',
      kelas: student.class,
      jam: timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }),
      day: timestamp.toLocaleDateString('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' }),
    };

    await this.studentModel.updateOne(
      { nis },
      { $set: { status: attendance.status }, $push: { attendanceHistory: attendance } }
    ).exec();

    return this.findOne(nis);
  }

  // ================= LOG PULANG =================
  async createPulangLog(nis: string, timestampStr: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const timestamp = timestampStr ? new Date(timestampStr) : new Date();
    const attendance: any = {
      status: 'Pulang',
      timestamp,
      method: 'Siswa Self-Log',
      mapel: 'Selesai KBM',
      kelas: student.class,
      jam: timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }),
      day: timestamp.toLocaleDateString('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' }),
    };

    await this.studentModel.updateOne(
      { nis },
      { $set: { status: 'Pulang', lastPulang: timestamp }, $push: { attendanceHistory: attendance } }
    ).exec();

    return this.findOne(nis);
  }

  // ================= UPDATE MANUAL =================
  async updateManual(nis: string, status: string, teacherName: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');
    const now = new Date();
    const attendance: any = {
      status,
      timestamp: now,
      method: `Manual by ${teacherName}`,
      mapel: 'Input Manual',
      kelas: student.class,
      jam: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }),
      day: now.toLocaleDateString('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' }),
    };
    await this.studentModel.updateOne(
      { nis },
      { $set: { status }, $push: { attendanceHistory: attendance } }
    ).exec();
    return this.findOne(nis);
  }

  // ================= RESET SEMUA =================
  async resetAllAttendance(): Promise<Student[]> {
    await this.studentModel.updateMany({}, { $set: { status: 'Belum Absen', attendanceHistory: [], lastPulang: null } });
    return this.findAll();
  }

  // ================= RESET 1 SISWA (FIXED ERROR) =================
  async resetOneAttendance(nis: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    await this.studentModel.updateOne(
      { nis },
      { 
        $set: { 
          status: 'Belum Absen', 
          attendanceHistory: [], 
          lastPulang: null 
        } 
      }
    ).exec();

    return this.findOne(nis);
  }

  // ================= DELETE SISWA =================
  async remove(nis: string): Promise<{ message: string }> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');
    await this.studentModel.deleteOne({ nis }).exec();
    return { message: 'Siswa berhasil dihapus' };
  }
}