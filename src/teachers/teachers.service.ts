import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Teacher, TeacherDocument } from './teacher.schema';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
  ) {}

  async findAll(): Promise<Teacher[]> {
    return this.teacherModel.find().exec();
  }

  async findOne(email: string): Promise<Teacher> {
    const teacher = await this.teacherModel.findOne({ email });
    if (!teacher) throw new NotFoundException('Guru tidak ditemukan');
    return teacher;
  }

  async create(data: { name: string; email: string; password: string; mapel: string }) {
    if (!data.password) throw new Error('Password harus diisi');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const teacher = new this.teacherModel({ ...data, password: hashedPassword });
    return teacher.save();
  }

  async login(email: string, password: string) {
    const teacher = await this.teacherModel.findOne({ email });
    if (!teacher) throw new NotFoundException('Email tidak ditemukan');
    const match = await bcrypt.compare(password, teacher.password);
    if (!match) throw new Error('Password salah');
    return teacher;
  }

  async remove(email: string) {
    const result = await this.teacherModel.deleteOne({ email });
    if (result.deletedCount === 0) throw new NotFoundException('Guru tidak ditemukan');
    return { message: 'Guru berhasil dihapus' };
  }
}
