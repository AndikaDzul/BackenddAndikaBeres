// src/config/config.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gps, GpsSchema } from './schemas/gps.schemas';

export type ConfigDocument = Config & Document;

@Schema({ timestamps: true })
export class Config {
  @Prop({ 
    type: GpsSchema, 
    default: { 
      lat: 0, 
      lng: 0, 
      radius: 50  // ✅ RADIUS SELALU ADA
    } 
  })
  loc1: Gps;

  @Prop({ 
    type: GpsSchema, 
    default: { 
      lat: 0, 
      lng: 0, 
      radius: 50  // ✅ RADIUS SELALU ADA
    } 
  })
  loc2: Gps;

  // Backward compatibility
  @Prop({ type: Number, default: 0 })
  lat: number;

  @Prop({ type: Number, default: 0 })
  lng: number;

  @Prop({ type: Number, default: 50 })
  radius: number;

  @Prop({
    type: [{
      code: { type: String, required: true },
      mapelReward: { type: Number, default: 0 },
      alfaReward: { type: Number, default: 0 },
      pointReward: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true }
    }],
    default: []
  })
  secretTokens: any[];
}

export const ConfigSchema = SchemaFactory.createForClass(Config);
