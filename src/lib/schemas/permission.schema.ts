import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    collection: 'permissions',
    timestamps: true,
    versionKey: false,
})
export class Permission extends Document {
    @Prop({
        type: String,
        required: true,
        unique: true,
        maxlength: 150,
    })
    name: string;

    @Prop({
        type: String,
        required: true,
        maxlength: 150,
    })
    description: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
