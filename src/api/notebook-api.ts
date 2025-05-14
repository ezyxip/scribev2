export type Notebook = {
    id: string;
    title: string;
    author: string;
    description: string;
    views: number;
    createdAt: Date;
    lastActiveAt: Date;
};


export interface NotebookApi{
    create: (n: Notebook) => Promise<Notebook | null> 
    delete: (id: string) => Promise<void>
    get: (count: number, page: number) => Promise<Notebook[]>
}
