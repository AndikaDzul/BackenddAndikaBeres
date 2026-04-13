import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class RatingDetail {
  @Prop({ required: true })
  statement: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;
}

export type EvaluationDocument = Evaluation & Document;

@Schema({ timestamps: true })
export class Evaluation {
  @Prop({ required: true })
  studentNis: string;

  @Prop({ required: true })
  teacherName: string;

  @Prop({ type: RatingDetail, required: true })
  discipline: RatingDetail;

  @Prop({ type: RatingDetail, required: true })
  teamwork: RatingDetail;

  @Prop({ type: RatingDetail, required: true })
  responsibility: RatingDetail;

  @Prop({ type: RatingDetail, required: true })
  initiative: RatingDetail;

  @Prop({ type: RatingDetail, required: true })
  ethics: RatingDetail;

  @Prop({ type: RatingDetail, required: true })
  professionalism: RatingDetail;

  @Prop({ type: RatingDetail, required: true })
  persistence: RatingDetail;

  @Prop()
  notes: string;
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);