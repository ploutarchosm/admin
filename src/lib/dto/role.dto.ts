import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
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
