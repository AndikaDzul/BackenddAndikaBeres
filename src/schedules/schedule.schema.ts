import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScheduleDocument = Schedule & Document;

@Schema()
export class Schedule {
  @Prop({ required: true })
  hari: string;

  @Prop({ required: true })
  jam: string;

  @Prop({ required: true })
  kelas: string;

  @Prop({ required: true })
  mapel: string;

  @Prop()
  guru: string;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
