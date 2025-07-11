import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EProvider } from "@ploutos/common";

@Schema({
    collection: 'providers',
    timestamps: true,
    versionKey: false,
})
export class Provider extends Document {
    @Prop({
        type: String,
        enum: EProvider,
        required: true,
    })
    provider: EProvider;

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
