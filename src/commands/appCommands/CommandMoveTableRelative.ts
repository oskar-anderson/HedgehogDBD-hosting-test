import Draw from "../../model/Draw";
import { ICommand } from "../ICommand";
import Point from "../../model/Point"

export default class CommandMoveTableRelative implements ICommand<CommandMoveTableRelativeArgs> {
    context: Draw;
    args: CommandMoveTableRelativeArgs;

    constructor(context: Draw, args: CommandMoveTableRelativeArgs) {
        this.context = context;
        this.args = args;
    }

    redo() {
        let table = this.context.schemaTables.find(x => x.id === this.args.id)!;
        table.position = { 
            x: table.position.x + this.args.x, 
            y: table.position.y + this.args.y
        };
        // this.context.schemaTables.forEach(x => x.updateRelations(this.context.schemaTables));
    }

    undo() {
        let table = this.context.schemaTables.find(x => x.id === this.args.id)!;
        table.position = {
            x: table.position.x - this.args.x, 
            y: table.position.y - this.args.y
        };
        // this.context.schemaTables.forEach(x => x.updateRelations(this.context.schemaTables));
    }
}

export class CommandMoveTableRelativeArgs {
    id: string;
    x: number;
    y: number;

    constructor(id: string, x: number, y: number) {
        this.id = id;
        this.x = x;
        this.y = y;
    }


    hydrate() {
        return this;
    } 
}