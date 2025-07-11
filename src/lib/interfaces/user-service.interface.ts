import { IUser } from "./user.interface";
import { CreateUserRegistrationDto, UserDto } from "../dto/user.dto";
import { DeleteResult, UpdateWriteOpResult } from "mongoose";

export interface IUserService {
    getById(userId: string): Promise<IUser>;
    getUserByEmail(userEmail: string): Promise<IUser>;
    getEmailById(userId: string): Promise<Pick<IUser, 'email'>>;
    create(user: CreateUserRegistrationDto): Promise<IUser>;
    createWithoutPassword(user: UserDto): Promise<IUser>;
    delete(userId: string): Promise<DeleteResult>;
    changePassword(newPassword: string, userId: string): Promise<UpdateWriteOpResult>;
}
