"use client";

import { NotebookExtApi } from "@/api/notebook-ext-api";
import { PostgresNotebookExtApi } from "@/api/postgres-notebook-ext-api";
import { createContext, useContext } from "react";
import { useNotebookApi } from "./UseNotebookApiWrapper";

const notebookExtApiContext = createContext<NotebookExtApi | null>(null);

export const NotebookExtApiWrapper = ({ children }: React.PropsWithChildren) => {

    const notebookApi = useNotebookApi();

    return (
        <notebookExtApiContext.Provider value={new PostgresNotebookExtApi(notebookApi)}>
            {children}
        </notebookExtApiContext.Provider>
    );
};

export const useNotebookExtApi = () => {
    const notebookApi = useContext(notebookExtApiContext);
    if (!notebookApi) throw "Не установлено API для работы с ноутбуком";
    return notebookApi as NotebookExtApi;
};
