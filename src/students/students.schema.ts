import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentDocument = Student & Document;

export interface Attendance {
  status: string;
  timestamp: Date;
  method?: string;
  mapel?: string;
  jam?: string;
  day?: string;
  kelas?: string;
  evidencePath?: string; // 1. Tambahkan di Interface
}

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true, unique: true })
  nis: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  class: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'Belum Absen' })
  status: string;

  @Prop({
    type: [
      {
        status: String,
        timestamp: Date,
        method: String,
        mapel: String,
        jam: String,
        day: String,
        kelas: String,
        evidencePath: String, // 2. Tambahkan di Schema agar Mongoose mengizinkan penyimpanan
      },
    ],
  })
  attendanceHistory: Attendance[];
}

export const StudentSchema = SchemaFactory.createForClass(Student);