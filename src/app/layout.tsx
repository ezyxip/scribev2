import { theme } from "@/utils/mui-theme";
import { ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { GetServerSidePropsContext, Metadata } from "next";

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
                    <ThemeProvider theme={theme}>{children}</ThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
