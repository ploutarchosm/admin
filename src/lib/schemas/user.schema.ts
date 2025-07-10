import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    collection: 'users',
    timestamps: true,
    versionKey: false,
})
export class User extends Document {
    @Prop({
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    })
    email: string;

    @Prop({
        type: String,
        required: function (this: User) {
            return this.hasPassword; // Require password only if `hasPassword` is true
        },
        default: null,
    })
    password: string;

    @Prop({
        type: Boolean,
        default: false,
        required: true,
    })
    active: boolean;

    @Prop({
        type: Number,
        default: 0,
    })
    loginAttempts: number;

    @Prop({
        type: Boolean,
        default: false,
    })
    isTwoFactorEnable: boolean;

    @Prop({
        type: Boolean,
        default: true,
    })
    hasPassword: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
