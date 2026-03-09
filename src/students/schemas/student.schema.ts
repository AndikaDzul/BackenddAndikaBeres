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
  evidencePath?: string;
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

  @Prop()
  lastPulang: Date; // Field baru untuk menyimpan waktu pulang terakhir

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
        evidencePath: String,
      },
    ],
  })
  attendanceHistory: Attendance[];
}

export const StudentSchema = SchemaFactory.createForClass(Student);