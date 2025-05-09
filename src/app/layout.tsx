import { theme } from "@/utils/mui-theme";
import { UserApiWrapper } from "@/wrappers/UserApiWrapper";
import { ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Scribe!",
    description: "Scribe - app for content",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AppRouterCacheProvider>
                    <ThemeProvider theme={theme}>
                        <UserApiWrapper>{children}</UserApiWrapper>
                    </ThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
