// src/config/config.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Config, ConfigDocument } from './config.schema';
import { StudentsService } from '../students/students.service'; // ✅ Import StudentsService
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(Config.name) private configModel: Model<ConfigDocument>,
    private readonly studentsService: StudentsService, // ✅ Inject StudentsService
  ) {}

  /**
   * Mengambil daftar token rahasia (Secret Tokens) dari database.
   */
  async getTokens(): Promise<any[]> {
    const config = await this.configModel.findOne().exec();
    return config?.secretTokens || [];
  }

  /**
   * Menyimpan daftar token rahasia baru.
   */
  async saveTokens(tokens: any[]): Promise<any[]> {
    // Gunakan findOneAndUpdate agar lebih robust dalam menyimpan array
    const config = await this.configModel.findOneAndUpdate(
      {}, // Ambil dokumen pertama
      { $set: { secretTokens: tokens } },
      { new: true, upsert: true }
    ).exec();

    console.log('✅ Tokens saved to database:', config.secretTokens);
    return config.secretTokens;
  }

  /**
   * Proses Klaim Token Rahasia oleh Siswa.
   * @param nis NIS Siswa yang mengeklaim.
   * @param code Kode token yang dimasukkan.
   */
  async redeemToken(nis: string, code: string): Promise<any> {
    const codeUpper = code.toUpperCase().trim();
    const config = await this.configModel.findOne().exec();
    const token = config?.secretTokens?.find(t => t.code.toUpperCase() === codeUpper && t.isActive);

    if (!token) {
      throw new NotFoundException('Token tidak valid atau sudah kadaluarsa');
    }

    const student = await this.studentsService.findOne(nis);
    if (!student) {
      throw new NotFoundException('Data siswa tidak ditemukan');
    }

    // Cek apakah sudah pernah klaim
    if (student.claimedTokens && student.claimedTokens.includes(codeUpper)) {
      throw new BadRequestException('Token promo ini sudah kamu pakai!');
    }

    // Siapkan Nilai baru (Update Points & Vouchers)
    const pointsReward = token.pointReward || 0;
    const mapelReward = token.mapelReward || 0;
    const alfaReward = token.alfaReward || 0;

    // Gunakan update manual di student service atau model secara langsung
    const updateData: any = {
      $inc: { 
        points: pointsReward,
        vouchersMapel: mapelReward,
        vouchersAlfa: alfaReward
      },
      $push: { 
        claimedTokens: codeUpper,
        pointHistory: {
          activity: `Klaim Token: ${codeUpper} 🎉`,
          points: pointsReward,
          category: 'reward',
          timestamp: new Date()
        }
      }
    };

    // Kita butuh akses ke studentModel di StudentsService atau buat helper disana.
    // Untuk ini, kita asumsikan kita bisa update via StudentsService atau langsung ke model jika kita inject.
    // Karena kita tidak inject StudentModel disini (hanya ConfigModel), 
    // sebaiknya kita tambahkan helper di StudentsService.
    
    // Tapi karena saya tidak mau mengubah StudentsService terlalu banyak, 
    // Mari kita gunakan method yang ada atau tambahkan helper di StudentsService.
    return this.studentsService.applyTokenReward(nis, updateData);
  }

  /**
   * Mengambil konfigurasi GPS dari MongoDB.
   * Jika tidak ada, fungsi ini akan membuat konfigurasi default.
   * Menjamin nilai yang dikembalikan memiliki format radius yang benar.
   * @returns {Promise<any>} Objek konfigurasi GPS untuk dua lokasi.
   */
  async getGpsConfig(): Promise<any> {
    let config = await this.configModel.findOne().lean().exec(); // ✅ .lean() untuk plain object
    
    if (!config) {
      config = await this.configModel.create({
        loc1: { lat: 0, lng: 0, radius: 50 },
        loc2: { lat: 0, lng: 0, radius: 50 },
      });
    }

    // ✅ FORCE RADIUS SELALU ADA DAN NUMERIK
    const result = {
      loc1: {
        lat: Number(config.loc1.lat) || 0,
        lng: Number(config.loc1.lng) || 0,
        radius: Number(config.loc1.radius) || 50  // ✅ RADIUS DIJAMIN
      },
      loc2: {
        lat: Number(config.loc2.lat) || 0,
        lng: Number(config.loc2.lng) || 0,
        radius: Number(config.loc2.radius) || 50  // ✅ RADIUS DIJAMIN
      },
      // Backward compatibility
      lat: Number(config.loc1.lat) || 0,
      lng: Number(config.loc1.lng) || 0,
      radius: Number(config.loc1.radius) || 50,
    };

    console.log('🔍 GPS CONFIG RESPONSE:', result); // Debug log
    return result;
  }

  /**
   * Memperbarui konfigurasi GPS di database.
   * Mendukung pembaruan loc1, loc2, dan backward compatibility.
   * @param data Data konfigurasi baru yang dikirim dari klien.
   * @returns {Promise<any>} Objek konfigurasi yang baru disimpan.
   */
  async saveGpsConfig(data: any): Promise<any> {
    let config = await this.configModel.findOne().exec();
    
    if (!config) {
      config = await this.configModel.create({
        loc1: { lat: 0, lng: 0, radius: 50 },
        loc2: { lat: 0, lng: 0, radius: 50 },
      });
    }

    // ✅ UPDATE LOC1 dengan RADIUS
    if (data.loc1) {
      config.loc1.lat = Number(data.loc1.lat) || config.loc1.lat;
      config.loc1.lng = Number(data.loc1.lng) || config.loc1.lng;
      config.loc1.radius = Number(data.loc1.radius) || 50; // ✅ RADIUS UPDATE
    }

    // ✅ UPDATE LOC2 dengan RADIUS
    if (data.loc2) {
      config.loc2.lat = Number(data.loc2.lat) || config.loc2.lat;
      config.loc2.lng = Number(data.loc2.lng) || config.loc2.lng;
      config.loc2.radius = Number(data.loc2.radius) || 50; // ✅ RADIUS UPDATE
    }

    // Backward compatibility
    if (data.lat !== undefined) config.loc1.lat = Number(data.lat);
    if (data.lng !== undefined) config.loc1.lng = Number(data.lng);
    if (data.radius !== undefined) config.loc1.radius = Number(data.radius);

    const saved = await config.save();

    // ✅ RETURN FULL DATA dengan RADIUS
    const result = {
      loc1: {
        lat: Number(saved.loc1.lat),
        lng: Number(saved.loc1.lng),
        radius: Number(saved.loc1.radius)  // ✅ RADIUS SELALU KEMBALI
      },
      loc2: {
        lat: Number(saved.loc2.lat),
        lng: Number(saved.loc2.lng),
        radius: Number(saved.loc2.radius)  // ✅ RADIUS SELALU KEMBALI
      }
    };

    console.log('💾 GPS SAVED:', result); // Debug log
    return result;
  }
}
