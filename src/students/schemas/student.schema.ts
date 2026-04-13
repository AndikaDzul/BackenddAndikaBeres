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

  @Prop({ type: Number, default: 100 })
  points: number;

  @Prop({ type: Number, default: 0 })
  vouchers: number;

  @Prop({ type: Number, default: 0 })
  vouchersMapel: number;

  @Prop({ type: Number, default: 0 })
  vouchersAlfa: number;

  @Prop({
    type: [
      {
        activity: String,
        points: Number,
        category: { type: String, enum: ['reward', 'deduction'] },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  pointHistory: any[];

  @Prop({ type: String, default: null })
  profileImage?: string;

  @Prop({ type: Date, default: null })
  lastPulang?: Date | null;

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
      },
    ],
    default: [],
  })
  attendanceHistory: Attendance[];
}

export const StudentSchema = SchemaFactory.createForClass(Student);