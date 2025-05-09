export interface User{
    nickname: string;
}

export interface UserSecure {
    password: string;
}

export interface UserContacts{
    email: string | undefined;
    phone: string | undefined;
}

export interface UserApi{
    current: () => Promise<User | null>;
    registry: (data: User & UserSecure & UserContacts) => Promise<User | null>;
    login: (data: User & UserSecure) => Promise<User | null>;
    logout: () => Promise<void>;
}

export const userApi: symbol  = Symbol.for("userApi");