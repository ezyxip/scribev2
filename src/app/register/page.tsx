"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    TextField,
    Typography,
    Link,
    useTheme,
    useMediaQuery,
    CssBaseline,
    GlobalStyles,
    Alert,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useUserApi } from "@/wrappers/UserApiWrapper";

export default function RegisterForm() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        nickname: "",
        email: "",
        password: "",
        phone: "",
    });
    const userApi = useUserApi();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Ограничиваем ввод только латинскими символами для nickname и password
        if (name === "nickname" || name === "password") {
            // Разрешаем только латинские буквы, цифры и некоторые специальные символы
            const latinRegex =
                /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/;
            if (!latinRegex.test(value)) return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await userApi.registry({
                nickname: formData.nickname,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined, // Необязательное поле
            });

            if (!result) throw new Error("Ошибка регистрации");

            router.push("/auth");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка регистрации");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CssBaseline />
            <GlobalStyles
                styles={{
                    body: {
                        backgroundColor: theme.palette.background.default,
                        minHeight: "100vh",
                    },
                }}
            />

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    p: isMobile ? 2 : 0,
                }}
            >
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: isMobile ? "100%" : 400,
                            p: isMobile ? 3 : 4,
                            bgcolor: "background.paper",
                            borderRadius: isMobile ? 0 : 2,
                            boxShadow: isMobile ? "none" : theme.shadows[3],
                        }}
                    >
                        <Typography
                            variant="h5"
                            component="h1"
                            gutterBottom
                            sx={{
                                textAlign: "center",
                                fontWeight: 500,
                                mb: 3,
                            }}
                        >
                            Регистрация
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <TextField
                                    required
                                    fullWidth
                                    label="Никнейм (только латиница)"
                                    name="nickname"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    size={isMobile ? "small" : "medium"}
                                    inputProps={{
                                        pattern:
                                            "[a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]*",
                                        title: "Пожалуйста, используйте только латинские символы",
                                    }}
                                />

                                <TextField
                                    required
                                    fullWidth
                                    type="email"
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    size={isMobile ? "small" : "medium"}
                                />

                                <TextField
                                    required
                                    fullWidth
                                    type="password"
                                    label="Пароль (только латиница)"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    size={isMobile ? "small" : "medium"}
                                    inputProps={{
                                        pattern:
                                            "[a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]*",
                                        title: "Пожалуйста, используйте только латинские символы",
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Телефон (необязательно)"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    size={isMobile ? "small" : "medium"}
                                />

                                <LoadingButton
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size={isMobile ? "medium" : "large"}
                                    loading={loading}
                                    sx={{ mt: 1 }}
                                >
                                    Зарегистрироваться
                                </LoadingButton>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 3, textAlign: "center" }}>
                            <Typography variant="body2">
                                Уже есть аккаунт?{" "}
                                <Link
                                    href="/auth"
                                    underline="hover"
                                    sx={{ fontWeight: 500 }}
                                >
                                    Войти
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
