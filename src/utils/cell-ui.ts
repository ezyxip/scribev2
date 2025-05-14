
export interface Cell {
    id: string;
    RenderInEditor: React.ComponentType<CellProps>
    RenderInViewer: React.ComponentType<CellProps>
    TopPanelFilling: React.ComponentType<CellProps>
    state: any;
}

export type CellProps = {
    state: any;
    focus: boolean;
    changeState: (newContent: any) => void;
};