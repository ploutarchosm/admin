import { Module, Global } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { Role, RoleSchema } from "./schemas/role.schema";
import { Permission, PermissionSchema } from "./schemas/permission.schema";
import { RolePermission, RolePermissionSchema } from "./schemas/role-permission.schema";
import { UserRoles, UserRolesSchema } from "./schemas/user-role.schema";
import { Provider, ProviderSchema } from "./schemas/provider.schema";
import { UserService } from "./services/user.service";
import { INJECTION_TOKENS } from "@ploutos/common";
import { PermissionService } from "./services/permission.service";
import { RoleService } from "./services/role.service";

@Global() // Makes providers available globally
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Role.name, schema: RoleSchema },
            { name: Permission.name, schema: PermissionSchema },
            { name: RolePermission.name, schema: RolePermissionSchema },
            { name: User.name, schema: UserSchema },
            { name: UserRoles.name, schema: UserRolesSchema },
            { name: Provider.name, schema: ProviderSchema },
        ])
    ],
    providers: [
        {
            provide: INJECTION_TOKENS.USER_SERVICE,
            useClass: UserService,
        },
        {
            provide: INJECTION_TOKENS.PERMISSION_SERVICE,
            useClass: PermissionService,
        },
        {
            provide: INJECTION_TOKENS.ROLE_SERVICE,
            useClass: RoleService,
        }
    ],
    exports: [
        INJECTION_TOKENS.USER_SERVICE,
        INJECTION_TOKENS.PERMISSION_SERVICE,
        INJECTION_TOKENS.ROLE_SERVICE,
    ],
})
export class AdminModule {}
