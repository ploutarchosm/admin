import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDefined,
    IsEmail,
    IsOptional,
    IsString,
} from 'class-validator';

export class UserDto {
    @ApiProperty()
    @IsDefined()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsDefined()
    @IsBoolean()
    active: boolean;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    hasPassword?: boolean;
}

export class CreateUserAdministratorDto extends UserDto {
    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    @ArrayMinSize(1)
    roles: string[];
}


export class CreateUserRegistrationDto extends UserDto {
    @ApiProperty()
    @IsDefined()
    @IsString()
    password: string;
}
