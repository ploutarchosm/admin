import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmpty } from 'lodash';
import { Model } from 'mongoose';
import { RolePermission } from "../schemas/role-permission.schema";
import { throwErrorStack } from "@ploutos/common";
import { CreateRolePermissionDto } from "../dto/role-permission.dto";

@Injectable()
export class RolePermissionService {
    private logger = new Logger(RolePermissionService.name);

    constructor(
        @InjectModel(RolePermission.name)
        private rolePermissionModel: Model<RolePermission>,
    ) {}

    /**
     * @description - Get a role/permission list
     * @param skip
     * @param take
     * @param id
     */
    async list(skip: number, take: number, id: string) {
        try {
            return this.rolePermissionModel
                .find({ roleId: id })
                .skip(skip)
                .limit(take)
                .exec();
        } catch (error) {
            this.logger.error('Error while getting the list of role/permissions: ', error);
            throwErrorStack(error, 'Error while getting the list of role/permissions');
        }
    }

    /**
     * @description - Delete a role/permission
     * @param roleId
     * @param permissionId
     */
    async delete(roleId: string, permissionId: string) {
        try {
            return await this.rolePermissionModel.deleteOne({
                roleId: roleId,
                permissionId: permissionId,
            }).exec();
        } catch (error) {
            this.logger.error('Error while deleting role/permissions: ', error);
            throwErrorStack(error, 'Error while deleting role/permissions');
        }
    }

    /**
     * @description - Create a new role/permission
     * @param dto
     */
    async create(dto: CreateRolePermissionDto) {
        return new this.rolePermissionModel(dto).save();
    }

    /**
     * @description - Get all role/permission by roleId
     * @param roleId
     */
    async getAllByRoleId(roleId: string) {
        return this.rolePermissionModel.find({ roleId: roleId }).exec();
    }

    /**
     * @description - Check if permission exists at any role
     * @param permissionId
     */
    async isPermissionExistAtAnyRole(permissionId: string) {
        let rolePermission: RolePermission[]
        try {
            rolePermission = await this.rolePermissionModel
                .find({ permissionId: permissionId })
                .exec();
        } catch (error) {
            this.logger.error('Error while getting role/permissions: ', error);
            throwErrorStack(error, 'Error while getting role/permissions');
        }
        return !isEmpty(rolePermission);
    }
}
