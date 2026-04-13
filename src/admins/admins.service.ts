import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcryptjs'
import { Admin } from './admin.schema'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    private jwtService: JwtService
  ) {}

  /**
   * Mendaftarkan admin baru ke database.
   * Melakukan validasi email unik dan enkripsi password.
   * @param data Objek berisi name, email, dan password.
   * @throws {BadRequestException} Jika email sudah terdaftar.
   * @returns Promise yang berisi objek admin yang baru dibuat.
   */
  async register(data: { name: string; email: string; password: string }) {
    const email = data.email.toLowerCase().trim()

    const existing = await this.adminModel.findOne({ email })
    if (existing) {
      throw new BadRequestException('Email sudah terdaftar')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const admin = new this.adminModel({
      name: data.name,
      email,
      password: hashedPassword,
      role: 'admin'
    })

    return admin.save()
  }

  /**
   * Melakukan proses otentikasi admin.
   * @param email Email admin.
   * @param password Password admin.
   * @throws {UnauthorizedException} Jika email tidak ditemukan atau password salah.
   * @returns Objek yang berisi pesan sukses, token JWT, dan data profil admin.
   */
  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim()

    const admin = await this.adminModel.findOne({
      email: normalizedEmail
    })

    if (!admin) {
      throw new UnauthorizedException('Email tidak terdaftar')
    }

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      throw new UnauthorizedException('Password salah')
    }

    const payload = {
      sub: admin._id,
      email: admin.email,
      role: admin.role
    }

    const token = this.jwtService.sign(payload)

    return {
      message: 'Login berhasil',
      token,
      adminId: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  }
}
