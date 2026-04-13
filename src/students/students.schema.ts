import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentDocument = Student & Document;

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

  // Riwayat Penilaian Bintang
  @Prop({
    type: [
      {
        aspect: String,
        stars: Number,
        note: String,
        teacherName: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  attitudeRatings: any[];

  // Cache rata-rata untuk mempermudah Ranking
  @Prop({ default: 0 })
  averageStars: number;
}

export const StudentSchema = SchemaFactory.createForClass(Student);