import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConfigDocument = Config & Document;

@Schema()
export class Config {
  @Prop({ default: 0 })
  lat: number;

  @Prop({ default: 0 })
  lng: number;

  @Prop({ default: 50 })
  radius: number;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);
