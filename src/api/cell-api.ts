export type Cell = {
    id: string,
    type: string,
    order: number,
    content: any
}

export interface CellApi{
    get: (notebookiId: string) => Promise<Cell[]>
    create: (notebookiId: string, cell: Cell) => Promise<Cell>
    update: (notebookiId: string, cell: Cell) => Promise<Cell>
    delete: (notebookiId: string, cellId: string) => Promise<void>
}