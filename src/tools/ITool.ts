import { Draw } from "../model/Draw";
import CustomMouseEvent from "../model/MouseEvent";
import { CreateTableTool } from "./CreateTableTool";
import { SelectTableTool } from "./SelectTableTool";

export interface ITool {
    init(): void;
    update(screenX: number, screenY: number, worldX: number, worldY: number): void;
    exit(): void;
    isDirty: boolean;
    getName(): IToolNames;
    mouseEventHandler(event: CustomMouseEvent): void
}

export enum IToolNames {
    select = "select",
    newTable = "newTable",
}

export class IToolManager {


    static toolActivate(draw: Draw, tool: IToolNames) {
        if (draw.activeTool) {
            draw.activeTool.exit();
        }
        switch(tool) {
            case IToolNames.select:
                draw.activeTool = new SelectTableTool(draw);
                break;
            case IToolNames.newTable:
                draw.activeTool = new CreateTableTool(draw);
                break;
            default:
                throw Error(`toolActivate. Tool: '${tool}' does not exist!`);
        }
        draw.activeTool!.init();
    }
}