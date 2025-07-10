import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsMongoId, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
    @ApiProperty()
    @IsDefined()
    @MaxLength(150)
    @IsString()
    name: string;

    @ApiProperty()
    @IsDefined()
    @MaxLength(150)
    @IsString()
    description: string;
}

export class UpdatePermissionDto extends CreatePermissionDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    _id: string;
}
