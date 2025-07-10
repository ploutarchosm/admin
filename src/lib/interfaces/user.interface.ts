export interface IUser {
    email: string;
    password: string | null;
    active: boolean;
    loginAttempts: number;
    isTwoFactorEnable: boolean;
    hasPassword: boolean;
}

export interface IUserViewModel {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    active: boolean;
    hasPassword: boolean;
    isTwoFactorEnable: boolean;
}
