import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {isEmpty} from 'lodash';
import {Model} from 'mongoose';
import {IListQuery, IListResponse, throwErrorStack} from "@ploutos/common";
import {Role} from "../schemas/role.schema";
import {Permission} from "../schemas/permission.schema";
import {RolePermission} from "../schemas/role-permission.schema";
import {CreateRoleDto} from "../dto/role,dto";
import {UserRoles} from "../schemas/user-role.schema";

@Injectable()
export class RoleService {
    private logger = new Logger(RoleService.name);

    constructor(
        @InjectModel(Role.name)
        private roleModel: Model<Role>,
        @InjectModel(Permission.name)
        private permissionModel: Model<Permission>,
        @InjectModel(RolePermission.name)
        private rolePermissionModel: Model<RolePermission>,
        @InjectModel(UserRoles.name)
        private userRolesModel: Model<UserRoles>,
    ) {}

    /**
     * @description - Create a new role
     * @param role
     */
    async create(role: CreateRoleDto) {
        return new this.roleModel(role).save();
    }

    /**
     * @description - Get the list of roles
     * @param query
     */
    async list(query: IListQuery): Promise<IListResponse<Role>> {
        let searchQuery: any;
        const { search, skip, take } = query;

        if (search) {
            searchQuery = search
                ? {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                    ],
                }
                : {};
        }

        const list = await this.roleModel
            .find(searchQuery)
            .skip(skip)
            .limit(take)
            .exec();

        const totalItems = await this.roleModel.countDocuments(searchQuery).exec();

        return {
            data: list,
            count: totalItems,
        };
    }

    /**
     * @description - Delete a role by id
     * @param id
     */
    async delete(id: string) {
        try {
            return await this.roleModel.deleteOne({ _id: id }).exec();
        } catch (error) {
            this.logger.error('Error while deleting role: ', error);
            throwErrorStack(error, 'Error while deleting role');
        }
    }

    /**
     * @description - Get user roles by userId
     * @param userId
     */
    async getUserRoles(userId: string) {
        try {
            return await this.userRolesModel.aggregate([
                { $match: {userId} },
                {
                    $lookup: {
                        from: 'roles', // Collection name for roles
                        localField: 'roleId',
                        foreignField: '_id',
                        as: 'role'
                    }
                },
                { $unwind: '$role' },
                { $replaceRoot: { newRoot: '$role' } }
            ]).exec();
        } catch (error) {
            this.logger.error('Error while getting user roles by userId: ', error);
            throwErrorStack(error, 'Error while getting user roles by userId.');
        }
    }

    /**
     * @description - Get a role by id
     * @param id
     */
    async getById(id: string) {
        try {
            return await this.roleModel.findOne({ _id: id }).exec();
        } catch (error) {
            this.logger.error('Error while getting role by id: ', error);
            throwErrorStack(error, 'Error while getting role by id.');
        }
    }


    /**
     * @description - Update a role by prototype
     * @param _id
     * @param value
     * @param proto
     */
    async updateByPrototype(
        _id: string,
        value: string,
        proto: 'name' | 'description',
    ) {
       try {
           return await this.roleModel
               .updateOne({ _id: _id },
                   { [proto]: value },
                   { upsert: true, new: true }
               ).exec();
       } catch (error) {
           this.logger.error('Error while updating role by prototype: ', error);
           throwErrorStack(error, 'Error while updating role by prototype.');
       }
    }

    /**
     * @description - Update a role
     * @param data
     */
    async update(data: Role) {
        try {
            return await this.roleModel
                .updateOne(
                    { _id: data._id },
                    {
                        name: data.name,
                        description: data.description,
                    },
                    { upsert: true, new: true },
                )
                .exec();
        } catch (error) {
            this.logger.error('Error while updating role: ', error);
            throwErrorStack(error, 'Error while updating role.');
        }
    }

    /**
     * @description - Add a permission to a role
     * @param roleId
     * @param permissionId
     */
    async addPermission(roleId: string, permissionId: string) {
        const [role, permission] = await Promise.all([
            this.validateEntityExists(
                () => this.getById(roleId),
                `Role ID: ${roleId} not found`,
                'Error while getting role by id.'
            ),
            this.validateEntityExists(
                () => this.permissionModel.findOne({ _id: permissionId }).exec(),
                `Permission ID: ${permissionId} not found.`,
                'Error while getting permission by id.'
            )
        ]);

        return new this.rolePermissionModel({
            roleId: role._id,
            permissionId: permission._id,
        }).save();
    }

    /**
     * @description - Get permissions of a role.
     * @param roleId
     */
    async getPermissions(roleId: string): Promise<Permission[]> {
        try {
            const rolePermissions = await this.rolePermissionModel.find({
                roleId: roleId,
            });

            if (isEmpty(rolePermissions)) {
                return [];
            }

            const permissionIds = rolePermissions.map(rp => rp.permissionId);
        
            return await this.permissionModel.find({
                _id: { $in: permissionIds }
            });
        } catch (error) {
            this.logger.error('Error while getting permissions by RoleId: ', error);
            throwErrorStack(error, 'Error while getting permissions by RoleId.');
        }
    }

    private async validateEntityExists<T>(
        fetchFn: () => Promise<T>,
        notFoundMessage: string,
        errorMessage: string
    ): Promise<T> {
        try {
            const entity = await fetchFn();
            if (!entity) {
                throw new BadRequestException(notFoundMessage);
            }
            return entity;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(errorMessage, error);
            throwErrorStack(error, errorMessage);
        }
    }
}
