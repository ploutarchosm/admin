import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../schemas/permission.schema';
import { IListQuery, IListResponse, throwErrorStack } from "@ploutos/common";
import { CreatePermissionDto } from '../dto/permission.dto';

@Injectable()
export class PermissionService {
    private logger = new Logger(PermissionService.name);

    constructor(
        @InjectModel(Permission.name)
        private permissionModel: Model<Permission>) {}

    /**
     * @description - Create a new permission
     * @param permission
     */
    async create(permission: CreatePermissionDto) {
        return new this.permissionModel(permission).save();
    }

    /**
     * @description - Get the list of permission
     * @param query
     */
    async list(query: IListQuery): Promise<IListResponse<Permission>> {
        let searchQuery: any;
        const { search, skip, take } = query;
        if (search) {
            searchQuery = search
                ? {
                    $or: [
                        { name: { $regex: search, $options: 'i' } }, // Case-insensitive search for name
                        { description: { $regex: search, $options: 'i' } }, // Case-insensitive search for description
                    ],
                }
                : {};
        }
        const list = await this.permissionModel
            .find(searchQuery)
            .skip(skip)
            .limit(take)
            .sort('name')
            .exec();

        const totalItems = await this.permissionModel
            .countDocuments(searchQuery)
            .exec();

        return {
            data: list,
            count: totalItems,
        };
    }

    /**
     * @description - Delete permission
     * @param permissionId
     */
    async delete(permissionId: string) {
        try {
            return await this.permissionModel.deleteOne({ _id: permissionId }).exec();
        } catch (error) {
            this.logger.error('Error while deleting permission: ', error);
            throwErrorStack(error, 'Error while deleting permission');
        }
    }

    /**
     * @description - Get permission by id
     * @param permissionId
     */
    async getById(permissionId: string) {
        try {
            return await this.permissionModel.findOne({ _id: permissionId }).exec();
        } catch (error) {
            this.logger.error('Error while getting permission by id: ', error);
            throwErrorStack(error, 'Error while getting permission by id');
        }
    }

    /**
     * @description - Update permission
     * @param data
     */
    async update(data: Permission) {
        try {
            return await this.permissionModel
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
            this.logger.error('Error while updating permission: ', error);
            throwErrorStack(error, 'Error while updating permission');
        }
    }
}
