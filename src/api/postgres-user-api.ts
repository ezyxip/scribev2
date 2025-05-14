"use client";
import { User, UserApi, UserContacts, UserSecure } from "./user-api";

export class PostgresUserApi implements UserApi {
    private readonly apiBase = "/api/user"; // Базовый путь к API routes

    current = async (): Promise<User | null> => {
        const nickname = localStorage.getItem("currentUser");
        return nickname ? { nickname } : null;
    };

    registry = async (data: User & UserSecure & UserContacts): Promise<User | null> => {
        try {
            const response = await fetch(`${this.apiBase}/registry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Ошибка регистрации");

            const user = await response.json();
            localStorage.setItem("currentUser", user.nickname);
            return user;
        } catch (err) {
            console.error("Ошибка:", err);
            return null;
        }
    };

    login = async (data: User & UserSecure): Promise<User | null> => {
        try {
            const response = await fetch(`${this.apiBase}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Неверный логин/пароль");

            const user = await response.json();
            localStorage.setItem("currentUser", user.nickname);
            return user;
        } catch (err) {
            console.error("Ошибка входа:", err);
            return null;
        }
    };

    logout = async (): Promise<void> => {
        localStorage.removeItem("currentUser");
    };
}