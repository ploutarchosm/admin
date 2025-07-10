import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({
    collection: 'role_permission',
    timestamps: true,
    versionKey: false,
})
export class RolePermission extends Document {
    @Prop({
        type: SchemaTypes.ObjectId,
        ref: 'roles',
        required: true,
    })
    roleId: string;

    @Prop({
        type: SchemaTypes.ObjectId,
        ref: 'permissions',
        required: true,
    })
    permissionId: string;
}

export const RolePermissionSchema =
    SchemaFactory.createForClass(RolePermission);
