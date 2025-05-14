"use client";

import { NotebookApi } from "@/api/notebook-api";
import { PostgresNotebookApi } from "@/api/postgres-notebook-api";
import { RestRepoNotebookApiDev } from "@/api/rest-repo-notebook-api-dev";
import { RestRepoNotebookPermsApiDev } from "@/api/rest-repo-notebook-api-perms-dev";
import LoadingSpinner from "@/components/loader-mock";
import ModalErrorAlert from "@/components/modal-error-alert";
import { useUser } from "@/hooks/use-user";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type NotebookApiManager = {
    setApi: (api: NotebookApi) => void;
};

export const notebookApiContext = createContext<
    (NotebookApi & NotebookApiManager) | null
>(null);


export const NotebookApiWrapper = ({ children }: React.PropsWithChildren) => {
    const [api, setApi] = useState<NotebookApi>(new PostgresNotebookApi());

    return (
        <notebookApiContext.Provider value={{ ...api, setApi: setApi }}>
            {children}
        </notebookApiContext.Provider>
    );
};

export const useNotebookApi = () => {
    const notebookApi = useContext(notebookApiContext);
    if (!notebookApi) throw "Не установлено API для работы с ноутбуком";
    return notebookApi as NotebookApi;
};
