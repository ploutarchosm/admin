import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProviderType } from '../interfaces/provider.interface';
import { Document } from 'mongoose';

@Schema({
    collection: 'providers',
    timestamps: true,
    versionKey: false,
})
export class Provider extends Document {
    @Prop({
        type: String,
        enum: ProviderType,
        required: true,
    })
    provider: ProviderType;

    @Prop({
        type: String,
        required: true,
    })
    displayName: string;

    @Prop({
        type: Boolean,
        required: true,
        default: false,
    })
    isActive: boolean;
}

export const ProviderSchema = SchemaFactory.createForClass(Provider);
