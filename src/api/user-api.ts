export const registerUser = async () => {};

export const loginUser = async () => {};

export const logoutUser = async () => {};

export interface JwtPayload {
    [key: string]: any;
}

export interface User {
    nick: string;
    email: string;
}

// === 1. Получает JWT как строку из куки ===
export const getJwtToken = (): string | null => {
    const cookieString = document.cookie;
    const cookies = cookieString.split(";").map((cookie) => cookie.trim());
    const jwtCookie = cookies.find((cookie) =>
        cookie.startsWith("SCRIBE_SESSION_JWT=")
    );

    if (!jwtCookie) {
        return null;
    }

    const token = jwtCookie.split("=")[1];
    return token;
};

// === 2. Возвращает payload из JWT ===
export const getJwtPayload = (): JwtPayload | null => {
    const token = getJwtToken();

    if (!token) {
        return null;
    }

    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            console.error("Invalid JWT format");
            return null;
        }

        // Декодируем payload
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(
                    (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                )
                .join("")
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Failed to parse JWT:", error);
        return null;
    }
};

// === 3. Удаление куки ===
const deleteCookie = (name: string) => {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

// === 4. Получение информации о пользователе ===
export const getCurrentUser = async (): Promise<User | null> => {
    const payload = getJwtPayload();

    if (!payload) {
        return null;
    }

    // Проверка срока действия
    const exp = payload.exp;
    const currentTime = Math.floor(Date.now() / 1000);

    if (exp && typeof exp === "number" && currentTime >= exp) {
        console.warn("JWT expired. Removing cookie.");
        deleteCookie("SCRIBE_SESSION_JWT");
        return null;
    }

    return {
        nick: payload.nick || "anonym",
        email: payload.email || "unknown@example.com",
    };
};