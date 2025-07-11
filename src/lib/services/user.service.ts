import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IUserService } from "../interfaces/user-service.interface";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../schemas/user.schema";
import { Model } from "mongoose";
import { CreateUserRegistrationDto, UserDto } from "../dto/user.dto";
import { IListResponse, NUserLocalClaim, throwErrorStack } from "@ploutos/common";
import { UserRoles } from "../schemas/user-role.schema";
import { Role } from "../schemas/role.schema";
import { isEmpty } from "lodash";
import { Permission } from "../schemas/permission.schema";
import { RolePermission } from "../schemas/role-permission.schema";

@Injectable()
export class UserService implements IUserService {
    private logger = new Logger(UserService.name);

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        @InjectModel(UserRoles.name)
        private userRolesModel: Model<UserRoles>,
        @InjectModel(Role.name)
        private roleModel: Model<Role>,
        @InjectModel(Permission.name)
        private permissionModel: Model<Permission>,
        @InjectModel(RolePermission.name)
        private rolePermissionModel: Model<RolePermission>,
    ) {}

    /**
     * @description - Create user with a password
     * @param user
     */
    async create(user: CreateUserRegistrationDto) {
        return new this.userModel(user).save();
    }

    /**
     * @description - Create user without a password
     * @param user
     */
    async createWithoutPassword(user: UserDto) {
        return new this.userModel(user).save();
    }

    /**
     * @description - Return the list of users
     * @param skip
     * @param take
     * @param search
     */
    async list(
        skip: number,
        take: number,
        search?: string,
    ): Promise<IListResponse<User>> {
        let searchQuery: any;

        if (search) {
            searchQuery = search
                ? {
                    $or: [
                        { email: { $regex: search, $options: 'i' } }, // Case-insensitive search for email
                        { firstName: { $regex: search, $options: 'i' } }, // Case-insensitive search for firstName
                        { lastName: { $regex: search, $options: 'i' } }, // Case-insensitive search for lastName
                    ],
                }
                : {};
        }

        const list = await this.userModel.find(searchQuery)
            .skip(skip)
            .limit(take)
            .exec();
        const totalItems =
            await this.userModel.countDocuments(searchQuery).exec();

        return {
            data: list,
            count: totalItems,
        };
    }

    /**
     * @description - Delete a user by userId
     * @param userId
     */
    async delete(userId: string) {
        try {
            return await this.userModel.deleteOne({ _id: userId }).exec();
        } catch (error) {
            this.logger.error('Error while deleting user: ', error);
            throwErrorStack(error, 'Error while deleting user')
        }
    }

    /**
     * @description - Get user by userId
     * @param userId
     */
    async getById(userId: string) {
        return await this.userModel.findOne({ _id: userId }).exec();
    }

    /**
     * @description - Get user by email address
     * @param userEmail
     */
    async getUserByEmail(userEmail:string) {
        return this.userModel.findOne({ email: userEmail }).exec();
    }

    /**
     * @description - Update user
     * @param data
     */
    async update(data: User) {
        return await this.userModel.updateOne(
            { _id: data._id },
            {
                active: data.active,
                email: data.email,
            },
            { upsert: true, new: true },
        ).exec();
    }

    /**
     * @description - Deactivate User
     * @param userId
     */
    async deactivate(userId: string) {
        let user: User;
        try {
            user = await this.userModel.findOne({ _id: userId });
            if (user) {
                user.active = false;
                await this.update(user);
            }
        } catch (error) {
            this.logger.error('Error while deactivating user: ', error);
            throwErrorStack(error, 'Error while deactivating user')
        }
    }

    /**
     * @description - Activate User
     * @param userId
     */
    async activate(userId: string) {
        let user: User;
        try {
            user = await this.userModel.findOne({ _id: userId });
            if (user) {
                user.active = true;
                await this.update(user);
            }
        } catch (error) {
            this.logger.error('Error while activating user: ', error);
            throwErrorStack(error, 'Error while activating user')
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
     * @description - Get user permission by userId
     * @param userId
     */
    async getUserPermissions(userId: string) {
        const permissions = [];
        const userRoles = await this.userRolesModel.find({
            userId: userId,
        });

        if (!isEmpty(userRoles)) {
            for (const userRole of userRoles) {
                const items = await this.userRoleServiceGetPermissions(userRole.roleId);

                if (!isEmpty(items)) {
                    permissions.push(...items);
                }
            }
        }
        return permissions;
    }

    /**
     * @description - Add user role
     * @param userId
     * @param roleId
     */
    async addUserRole(userId: string, roleId: string) {
        const role = await this.roleModel.findOne({ _id: roleId });

        if (!role) {
            throw new BadRequestException(`Role ID: ${roleId} not found.`);
        }

        const user = await this.userModel.findOne({ _id: userId });

        if (!user) {
            throw new BadRequestException(`User ID: ${userId} not found`);
        }

        return await this.userRolesModel.create({
            roleId: role.id,
            userId: user.id,
        });
    }

    /**
     * @description Deletes user role
     * @param userId
     * @param roleId
     */
    async deleteUserRole(userId: string, roleId: string) {
        return this.userRolesModel.deleteOne({
            roleId: roleId,
            userId: userId,
        }).exec();
    }

    /**
     * @description Get all user claims
     * @param userId
     */
    async getAllClaims(userId: string) {
        const user = await this.userModel.findOne({ _id: userId })
            .select(
                '_id firstName lastName email address city country postalCode phone',
            )
            .exec();

        const userClaims: { key: string; value: string }[] = [];

        if (user._id) userClaims.push({ key: '_id', value: user._id as string });
        if (user['firstName'])
            userClaims.push({ key: 'firstName', value: user['firstName'] });
        if (user['lastName'])
            userClaims.push({ key: 'lastName', value: user['lastName'] });
        if (user.email) userClaims.push({ key: 'email', value: user.email });
        if (user['address'])
            userClaims.push({ key: 'address', value: user['address'] });
        if (user['city']) userClaims.push({ key: 'city', value: user['city'] });
        if (user['country'])
            userClaims.push({ key: 'country', value: user['country'] });
        if (user['postalCode'])
            userClaims.push({ key: 'postalCode', value: user['postalCode'] });
        if (user['phone']) userClaims.push({ key: 'phone', value: user['phone'] });

        return userClaims;
    }

    /**
     * @description Get user claim
     * @param userId
     * @param claim
     */
    async getClaim(userId: string, claim: NUserLocalClaim) {
        return this.userModel.findOne({ _id: userId }, claim).exec();
    }

    /**
     * @description Set a claim for user.
     * @param userId
     * @param claim
     * @param value
     */
    async setClaim(userId: string, claim: NUserLocalClaim, value: string) {
        await this.userModel.updateOne(
            { _id: userId },
            { [claim]: value },
            { upsert: true, new: true },
        ).exec();
    }

    /**
     * @description - Get user email address by userId
     * @param userId
     */
   async getEmailById(userId: string) {
        return this.userModel
            .findOne({ _id: userId })
            .select('email')
            .lean()
            .exec();
    }

    /**
     * @description Checks if user has assigned a role by userID
     * @param roleId
     */
    async hasUserAssignedRole(roleId: string) {
        const userRole = await this.userRolesModel.findOne({
            roleId: roleId,
        }).exec();

        return !isEmpty(userRole); //
    }

    /**
     * @description - Change user password by userId
     * @param newPassword
     * @param userId
     */
    async changePassword(newPassword: string, userId: string) {
        return this.userModel.updateOne(
            { _id: userId },
            {
                password: newPassword,
            },
            { upsert: true, new: true },
        ).lean().exec();
    }

    /**
     * @Description Validate user by email address, if user doesn't exist create a new without a password.
     * @param userEmail
     */
    async validateUserByEmail(userEmail: string) {

    }

    /**
     * @Description Create a new user with a free role.
     * @param email
     * @private
     */
    private async createNewUserWithFreeRole(email: string) {

    }

    private async userRoleServiceGetPermissions(roleId: string) {
        const permissions: any[] = [];
        const rolePermissions = await this.rolePermissionModel.find({
            roleId: roleId,
        });
        if (!isEmpty(rolePermissions)) {
            for (const rolePermission of rolePermissions) {
                const permission = await this.permissionModel.find({
                    _id: rolePermission.permissionId,
                });
                if (permission) {
                    permissions.push(...permission);
                }
            }
        }
        return permissions;
    }

}
