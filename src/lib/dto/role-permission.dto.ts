import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsMongoId } from 'class-validator';

export class CreateRolePermissionDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    roleId: string;

    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    permissionId: string;
}
