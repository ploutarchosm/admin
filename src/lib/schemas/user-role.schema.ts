import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({
    collection: 'user_roles',
    timestamps: true,
    versionKey: false,
})
export class UserRoles extends Document {
    @Prop({
        type: SchemaTypes.ObjectId,
        ref: 'users',
        required: true,
    })
    userId: string;

    @Prop({
        type: SchemaTypes.ObjectId,
        ref: 'roles',
        required: true,
    })
    roleId: string;
}

export const UserRolesSchema = SchemaFactory.createForClass(UserRoles);
