"use client";
import { User, UserApi, UserContacts, UserSecure } from "./user-api";

export class RestRepoUserApiDev implements UserApi {
    private readonly apiGateway = process.env.NEXT_PUBLIC_API_GATEWAY!;

    current: () => Promise<User | null> = async () => {
        const nickname = localStorage.getItem("currentUser");
        if (!nickname) return null;

        return {
            nickname: nickname,
        };
    };
    registry: (data: User & UserSecure & UserContacts) => Promise<User | null> =
        async (data) => {
            try {
                const rootResponse = await fetch(this.apiGateway);
                const root = await rootResponse.json();

                const usersLink = root._links.users.href.replace(
                    /\{.*?\}/g,
                    ""
                );
                const userSecuresLink = root._links.userSecures.href.replace(
                    /\{.*?\}/g,
                    ""
                );
                const userContactsesLink =
                    root._links.userContactses.href.replace(/\{.*?\}/g, "");

                const createUserResponse = await fetch(usersLink, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nickname: data.nickname,
                    }),
                });
                const createdUser = await createUserResponse.json();

                const userLink = createdUser._links.self.href;

                await fetch(userSecuresLink, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user: userLink,
                        password: data.password,
                    }),
                });

                await fetch(userContactsesLink, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user: userLink,
                        email: data.email,
                        phone: data.phone,
                    }),
                });

                return createdUser as User;
            } catch (err) {
                console.log(err);
                return null;
            }
        };
    login: (data: User & UserSecure) => Promise<User | null> = async (data) => {
        try {
            const rootResponse = await fetch(this.apiGateway);
            const root = await rootResponse.json();

            const usersLink = root._links.users.href.replace(/\{.*?\}/g, "");
            const usersResponse = await fetch(usersLink);
            const users = await usersResponse.json();

            const user = users._embedded?.users?.find(
                (u: User) => u.nickname === data.nickname
            );

            if (!user) {
                throw new Error("Юзер не найден, иди регистрируйся");
            }

            const userSecuresLink = root._links.userSecures.href.replace(
                /\{.*?\}/g,
                ""
            );
            const securesResponse = await fetch(userSecuresLink);
            const secures = await securesResponse.json();

            const getUserIdFromLink = (link: string) => {
                const match = link.match(/\/(\d+)(\/|$)/);
                return match ? match[1] : null;
            };

            const userSecure = secures._embedded?.userSecures?.find(
                (s: any) =>
                    getUserIdFromLink(s._links.user.href) ===
                    getUserIdFromLink(user._links.self.href)
            );

            if (!userSecure || userSecure.password !== data.password) {
                throw new Error("Неверный пароль, дебил");
            }

            localStorage.setItem("currentUser", user.nickname);
            return user as User;
        } catch (err) {
            console.error("Ошибка входа:", err);
            return null;
        }
    };
    logout: () => Promise<void> = () => {
        localStorage.removeItem("currentUser");
        return Promise.resolve();
    };
}
