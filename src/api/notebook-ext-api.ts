import { Notebook, NotebookApi } from "./notebook-api";

export interface NotebookExtApi extends NotebookApi {
    getOne: (id: string) => Promise<Notebook | null>
    update: (notebook: Notebook) => Promise<void>
}