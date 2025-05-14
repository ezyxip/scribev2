import { theme } from "@/utils/mui-theme";
import { CellApiWrapper } from "@/wrappers/cell-api-wrapper";
import { CellWrapper } from "@/wrappers/cell-types-wrapper";
import { NotebookExtApiWrapper } from "@/wrappers/notebook-ext-api-wrapper";
import { NotebookApiWrapper } from "@/wrappers/UseNotebookApiWrapper";
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
                        <UserApiWrapper>
                            <NotebookApiWrapper>
                                <CellWrapper>
                                    <CellApiWrapper>
                                        <NotebookExtApiWrapper>
                                            {children}
                                        </NotebookExtApiWrapper>
                                    </CellApiWrapper>
                                </CellWrapper>
                            </NotebookApiWrapper>
                        </UserApiWrapper>
                    </ThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
