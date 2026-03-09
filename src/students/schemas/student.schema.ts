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

  // FIELD BARU: Mengizinkan Date atau null agar tidak error saat reset/update
  @Prop({ type: Date, default: null })
  lastPulang?: Date | null;

  @Prop({ type: [{ 
    status: String, 
    timestamp: Date, 
    method: String, 
    mapel: String, 
    jam: String, 
    day: String,
    kelas: String
  }]})
  attendanceHistory: Attendance[];
}

export const StudentSchema = SchemaFactory.createForClass(Student);