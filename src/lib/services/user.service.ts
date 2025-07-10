import { Injectable, Logger } from '@nestjs/common';
import { IUserService } from "../interfaces/user-service.interface";
import { IUser } from '../interfaces/user.interface';
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../schemas/user.schema";
import { Model } from "mongoose";
import { CreateUserRegistrationDto, UserDto } from "../dto/user,dto";
import { IListResponse, throwErrorStack } from "@ploutos/common";

@Injectable()
export class UserService implements IUserService {
    private logger = new Logger(UserService.name);

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
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
    getById(userId: string): Promise<IUser> {
        return this.userModel.findOne({ _id: userId }).exec();
    }

    /**
     * @description - Get user by email address
     * @param userEmail
     */
    getUserByEmail(userEmail:string): Promise<IUser> {
        return this.userModel.findOne({ email: userEmail }).lean().exec();
    }

    /**
     * @description - Get user email address by userId
     * @param userId
     */
    getEmailById(userId: string) {
        return this.userModel
            .findOne({ _id: userId })
            .select('email')
            .lean()
            .exec();
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
     * @description - Update user
     * @param data
     */
    async update(data: User) {
        return this.userModel.updateOne(
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
}
