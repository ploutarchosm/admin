import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDefined,
    IsEnum,
    IsMongoId,
    IsString,
} from 'class-validator';
import { EProvider } from "@ploutos/common";

export class ProviderDto {
    @ApiProperty()
    @IsDefined()
    @IsEnum(EProvider)
    provider: EProvider;

    @ApiProperty()
    @IsDefined()
    @IsString()
    displayName: string;

    @ApiProperty()
    @IsDefined()
    @IsBoolean()
    isActive: boolean;
}

export class UpdateProviderDto extends ProviderDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    _id: string;
}
