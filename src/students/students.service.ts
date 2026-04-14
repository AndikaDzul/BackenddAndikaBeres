import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { Student, StudentDocument } from './schemas/student.schema';
import { CreateStudentDto } from './dto/create-students.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { EvaluationsService } from '../evaluations/evaluations.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private readonly evaluationsService: EvaluationsService,
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
      points: 100,
      attendanceHistory: [],
    });
    return student.save();
  }

  // ================= GET ALL SISWA (DENGAN PENILAIAN) =================
  async findAll(): Promise<any[]> {
    const students = await this.studentModel.find().exec();
    const nisList = students.map(s => s.nis);

    const evaluationsMap = await this.evaluationsService.getLatestEvaluationsMap(nisList);

    return students.map((student) => ({
      ...student.toObject(),
      lastEvaluation: evaluationsMap[student.nis] || null,
    }));
  }

  // ================= GET ONE SISWA (DENGAN PENILAIAN) =================
  async findOne(nis: string): Promise<any> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const evaluations = await this.evaluationsService.findByStudent(nis);
    return {
      ...student.toObject(),
      lastEvaluation: evaluations.length > 0 ? evaluations[0] : null,
    };
  }

  // ================= LOGIN SISWA =================
  async login(nis: string, password: string): Promise<any | null> {
    const studentDoc = await this.studentModel.findOne({ nis }).exec();
    if (!studentDoc) return null;

    const match = await bcrypt.compare(password, studentDoc.password);
    if (!match) return null;

    const evaluations = await this.evaluationsService.findByStudent(nis);
    return {
      ...studentDoc.toObject(),
      lastEvaluation: evaluations.length > 0 ? evaluations[0] : null,
    };
  }

  // ================= ABSENSI QR =================
  async createAttendance(nis: string, body: CreateAttendanceDto): Promise<any> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    let timestamp = body.timestamp ? new Date(body.timestamp) : new Date();
    if (isNaN(timestamp.getTime())) {
      timestamp = new Date(); // Fallback ke waktu sekarang jika input tidak valid
    }
    const attendance: any = {
      status: body.status || 'Hadir',
      timestamp,
      method: body.method || 'QR Scan',
      qrToken: body.qrToken,
      mapel: body.mapel || 'Pelajaran Umum',
      kelas: student.class,
      jam: timestamp.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }),
      day: timestamp.toLocaleDateString('id-ID', {
        weekday: 'long',
        timeZone: 'Asia/Jakarta',
      }),
    };

    let pointsChange = 28; // Reward default +28 point for attending
    let activity = `Absensi Hadir (${attendance.mapel})`;
    let type: 'reward' | 'deduction' = 'reward';
    let usedVoucher = false;

    // Logic Pinalti & Voucher Protection
    if (body.status === 'Alfa' || body.status === 'Izin' || body.status === 'Sakit' || body.status === 'Alpha') {
      if (student.vouchersAlfa > 0) {
        pointsChange = 0;
        activity = `Voucher Digunakan: Proteksi ${body.status}`;
        type = 'reward';
        usedVoucher = true;
      } else {
        pointsChange = -27;
        activity = `Absensi ${body.status} (${attendance.mapel})`;
        type = 'deduction';
      }
    }

    const updateOps: any = {
      $set: { status: attendance.status },
      $push: { 
        attendanceHistory: attendance,
      },
    };

    if (usedVoucher) {
      updateOps.$inc = { vouchersAlfa: -1 };
    }

    if (pointsChange !== 0 || usedVoucher) {
      if (pointsChange !== 0) {
        if (!updateOps.$inc) updateOps.$inc = {};
        updateOps.$inc.points = pointsChange;
      }
      if (!updateOps.$push) updateOps.$push = {};
      updateOps.$push.pointHistory = {
        activity,
        points: pointsChange,
        category: type,
        timestamp: new Date(),
      };
    }

    await this.studentModel.updateOne({ nis }, updateOps).exec();

    return this.findOne(nis);
  }

  // ================= LOG PULANG =================
  async createPulangLog(nis: string, timestampStr: string): Promise<any> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const timestamp = timestampStr ? new Date(timestampStr) : new Date();
    const attendance: any = {
      status: 'Pulang',
      timestamp,
      method: 'Siswa Self-Log',
      mapel: 'Selesai KBM',
      kelas: student.class,
      jam: timestamp.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }),
      day: timestamp.toLocaleDateString('id-ID', {
        weekday: 'long',
        timeZone: 'Asia/Jakarta',
      }),
    };

    await this.studentModel.updateOne(
      { nis },
      {
        $set: { status: 'Pulang', lastPulang: timestamp },
        $push: { attendanceHistory: attendance },
      },
    ).exec();

    return this.findOne(nis);
  }

  // ================= UPDATE MANUAL =================
  async updateManual(nis: string, status: string, teacherName: string): Promise<any> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const now = new Date();
    const attendance: any = {
      status,
      timestamp: now,
      method: `Manual by ${teacherName}`,
      mapel: 'Input Manual',
      kelas: student.class,
      jam: now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }),
      day: now.toLocaleDateString('id-ID', {
        weekday: 'long',
        timeZone: 'Asia/Jakarta',
      }),
    };

    let pointsChange = 0;
    let activity = '';
    let category: 'reward' | 'deduction' = 'deduction';
    let usedVoucher = false;
    let voucherField = '';

    if (status === 'Alfa' || status === 'Izin' || status === 'Sakit' || status === 'Alpha') {
      // Check for voucher protection
      if (student.vouchersAlfa > 0) {
        pointsChange = 0;
        activity = `Voucher Digunakan: Proteksi ${status} (Manual)`;
        category = 'reward';
        usedVoucher = true;
        voucherField = 'vouchersAlfa';
      } else {
        pointsChange = -27;
        activity = `Absensi ${status} (Manual by ${teacherName})`;
        category = 'deduction';
      }
    } else if (status === 'Terlewat Mapel') {
      // Check for voucher protection (Mapel)
      if (student.vouchersMapel > 0) {
        pointsChange = 0;
        activity = `Voucher Digunakan: Proteksi Terlewat Mapel (Manual)`;
        category = 'reward';
        usedVoucher = true;
        voucherField = 'vouchersMapel';
      } else {
        pointsChange = -12;
        activity = `Terlewat Mapel (Manual by ${teacherName})`;
        category = 'deduction';
      }
    } else if (status === 'Hadir') {
      pointsChange = 28;
      activity = `Absensi Hadir (Manual by ${teacherName})`;
      category = 'reward';
    }

    const updateOps: any = {
      $set: { status },
      $push: { attendanceHistory: attendance },
    };

    if (usedVoucher) {
      updateOps.$inc = { [voucherField]: -1 };
    }

    if (pointsChange !== 0 || usedVoucher) {
      if (pointsChange !== 0) {
        if (!updateOps.$inc) updateOps.$inc = {};
        updateOps.$inc.points = pointsChange;
      }
      if (!updateOps.$push) updateOps.$push = {};
      updateOps.$push.pointHistory = {
        activity,
        points: pointsChange,
        category: category,
        timestamp: new Date(),
      };
    }

    await this.studentModel.updateOne({ nis }, updateOps).exec();

    return this.findOne(nis);
  }

  // ================= CLAIM VOUCHER =================
  async claimVoucher(nis: string, voucherCode: string): Promise<any> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const points = 10;
    const historyEntry = {
      activity: `Klaim Voucher Code: ${voucherCode}`,
      points: points,
      category: 'reward' as const,
      timestamp: new Date(),
    };

    await this.studentModel.updateOne(
      { nis },
      { 
        $inc: { points },
        $push: { pointHistory: historyEntry }
      },
    ).exec();

    return this.findOne(nis);
  }

  // ================= UPDATE POINTS MANUAL =================
  async updatePoints(nis: string, points: number): Promise<any> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const currentPoints = student.points !== undefined ? student.points : 100;
    const diff = points - currentPoints;
    const historyEntry = {
      activity: 'Update Point Manual (Admin)',
      points: diff,
      category: diff > 0 ? ('reward' as const) : ('deduction' as const),
      timestamp: new Date(),
    };

    await this.studentModel.updateOne(
      { nis },
      { 
        $set: { points },
        $push: { pointHistory: historyEntry }
      }
    ).exec();

    return this.findOne(nis);
  }

  // ================= BULK UPDATE POINTS & VOUCHERS =================
  async bulkUpdatePoints(data: { nis: string; points: number; vouchers: number; vouchersMapel?: number; vouchersAlfa?: number }[]): Promise<any> {
    const promises = data.map(item => {
      return this.studentModel.updateOne(
        { nis: item.nis },
        { 
          $set: { 
            points: item.points, 
            vouchers: item.vouchers,
            vouchersMapel: item.vouchersMapel || 0,
            vouchersAlfa: item.vouchersAlfa || 0
          } 
        }
      ).exec();
    });
    
    await Promise.all(promises);
    return { success: true, message: 'Data point and voucher updated' };
  }

  // ================= BUY VOUCHER (POINTS TO VOUCHER) =================
  async buyVoucher(nis: string, cost: number, itemType = 'generic'): Promise<any> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    if (student.points < cost) {
      throw new BadRequestException('Point tidak cukup');
    }

    let voucherField = 'vouchers';
    let activity = 'Pembelian Voucher Generic';
    if (itemType === 'mapel') {
      voucherField = 'vouchersMapel';
      activity = 'Pembelian Voucher Absen Mapel';
    } else if (itemType === 'alfa') {
      voucherField = 'vouchersAlfa';
      activity = 'Pembelian Voucher Izin/Alfa';
    }

    const historyEntry = {
      activity,
      points: -cost,
      category: 'deduction' as const,
      timestamp: new Date(),
    };

    const updateData: any = {
      $inc: { 
        points: -cost, 
        [voucherField]: 1 
      },
      $push: { pointHistory: historyEntry }
    };

    await this.studentModel.updateOne({ nis }, updateData).exec();

    return this.findOne(nis);
  }



  // ================= RESET SEMUA =================
  async resetAllAttendance(): Promise<any[]> {
    await this.studentModel.updateMany(
      {},
      {
        $set: {
          status: 'Belum Absen',
          attendanceHistory: [],
          lastPulang: null,
        },
      },
    );
    return this.findAll();
  }

  // ================= RESET 1 SISWA =================
  async resetOneAttendance(nis: string): Promise<any> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    await this.studentModel.updateOne(
      { nis },
      {
        $set: {
          status: 'Belum Absen',
          attendanceHistory: [],
          lastPulang: null,
        },
      },
    ).exec();

    return this.findOne(nis);
  }

  // ================= ABSENCE PENALTY (NEW) =================
  async absencePenalty(nis: string, type: string, description?: string): Promise<any> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    let pointsChange = type === 'mapel' ? -12 : -27;
    let activity = description || (type === 'mapel' ? 'Terlewat Mapel' : 'Pinalti Absensi');
    let category: 'reward' | 'deduction' = 'deduction';
    let usedVoucher = false;
    let voucherField = '';

    if (type === 'mapel' && student.vouchersMapel > 0) {
      pointsChange = 0;
      activity = `Voucher Digunakan: Proteksi Terlewat Mapel`;
      category = 'reward';
      usedVoucher = true;
      voucherField = 'vouchersMapel';
    } else if (type !== 'mapel' && student.vouchersAlfa > 0) {
      pointsChange = 0;
      activity = `Voucher Digunakan: Proteksi Pinalti Absensi`;
      category = 'reward';
      usedVoucher = true;
      voucherField = 'vouchersAlfa';
    }
    
    const updateData: any = {
      $push: { 
        pointHistory: {
          activity,
          points: pointsChange,
          category,
          timestamp: new Date(),
        }
      }
    };

    if (usedVoucher) {
      updateData.$inc = { [voucherField]: -1 };
    }

    if (pointsChange !== 0) {
      if (!updateData.$inc) updateData.$inc = {};
      updateData.$inc.points = pointsChange;
    }

    await this.studentModel.updateOne({ nis }, updateData).exec();

    return this.findOne(nis);
  }

  // ================= CLEAR POINT HISTORY =================
  async clearPointHistory(nis: string): Promise<any> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    await this.studentModel.updateOne(
      { nis },
      { $set: { pointHistory: [] } }
    ).exec();

    return this.findOne(nis);
  }

  // ================= UPDATE PROFILE IMAGE =================
  async updateProfileImage(nis: string, imageData: string): Promise<any> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    await this.studentModel.updateOne(
      { nis },
      { $set: { profileImage: imageData } }
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