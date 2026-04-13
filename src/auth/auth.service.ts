import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Teacher } from '../teachers/teacher.schema'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Teacher.name)
    private teacherModel: Model<Teacher>,
  ) {}

  /**
   * Melakukan proses login untuk guru.
   * Memvalidasi email dan password secara manual (tanpa bcrypt).
   * @param email Email guru.
   * @param password Password guru.
   * @throws {UnauthorizedException} Jika email tidak ditemukan atau password salah.
   * @returns Objek profil guru jika berhasil.
   */
  async login(email: string, password: string) {
    const teacher = await this.teacherModel.findOne({ email })

    if (!teacher) {
      throw new UnauthorizedException('Email tidak ditemukan')
    }

    if (teacher.password !== password) {
      throw new UnauthorizedException('Password salah')
    }

    return {
      teacherId: teacher._id,
      name: teacher.name,
      role: teacher.role,
      email: teacher.email,
    }
  }
}
