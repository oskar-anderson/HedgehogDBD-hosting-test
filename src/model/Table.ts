import { BitmapText, Point, Text, Container } from "pixi.js";
import { MyRect } from "./MyRect";
import { CostGrid, CostGridTileTypes } from "./CostGrid";
import { TableRow } from "./TableRow";
import { Relation } from "./Relation";
import AStarFinderCustom from "../path/AStarFinderCustom";

export class Table {
    displayable: Text = new Text("", { fontFamily: `Inconsolata` });
    readonly id: string = crypto.randomUUID();
    isHover: boolean = false;
    private isDirty = true;
    relations: Relation[] = [];
    
    constructor(
        private position: Point, 
        public head: string, 
        public tableRows: TableRow[], 
        {
            displayable = new Text("", { fontFamily: `Inconsolata` }), 
            id = crypto.randomUUID(),
            isHover = false
        } = {}
        ) {
        this.displayable = displayable;
        this.id = id;
        this.isHover = isHover;
    }

    setPosition(newPosition: Point, fontSize: { size: number, width: number, height: number }) {
        this.position = newPosition;
        this.displayable.position = newPosition.multiply(new Point(fontSize.width, fontSize.height));
    }

    getPosition() {
        return this.position;
    }

    setIsDirty(value: boolean) {
        this.isDirty = value;
    }

    getIsDirty() {
        return this.isDirty;
    }

    setIsHover(isHover: boolean, tables: Table[]) {
        this.relations.forEach(x => { 
            x.isDrawable = !isHover;
            x.isDirty = true;
        });
        tables
            .flatMap(table => table.relations)
            .filter(x => x.equals(x.source, this))
            .forEach(rel => {
                rel.isDrawable = !isHover;
                rel.isDirty = true;   
            });
        this.isHover = isHover;
        this.isDirty = true;
    }

    getIsHover() {
        return this.isHover;
    }

    equals(other: Table) {
        return this.id === other.id;
    }

    getRelationStartingPoint(worldSize: MyRect, targetTable: Table): Point | null {
        let referenceCenter =  targetTable.getContainingRect().getLargestFittingSquareClosestToPoint(this.getContainingRect().getCenter()).getCenter();
        let closestFromTablePoint: Point | null = null;
        let containingRect = this.getContainingRect();
        let relationAttachmentPoints = containingRect.getRelationAttachmentPoints(worldSize);
        for (let point of relationAttachmentPoints) {
            if ((closestFromTablePoint === null || 
                AStarFinderCustom.euclidean(closestFromTablePoint, referenceCenter) > 
                AStarFinderCustom.euclidean(point, referenceCenter))
            ) {
                closestFromTablePoint = point;
            }
        }
        return closestFromTablePoint
    }

    getContainingRect() {
        let columnWidth = 2 + Math.max(...(this.tableRows.map(el => el.name.length))) + 3 
            + Math.max(...(this.tableRows.map(el => el.datatype.length))) + 3 + 
            Math.max(...(this.tableRows.map(el => el.attributes.join(", ").length))) + 2;
        let nameWidth = 2 + this.head.length + 2;
        return new MyRect(
            this.position.x, 
            this.position.y, 
            Math.max(columnWidth, nameWidth), 
            4 + this.tableRows.length
        );
    }

    getReferences(tables: Table[]) {
        let references = [];
        for (let tableRow of this.tableRows) {
            let matches = [...tableRow.attributes.join('').matchAll(/FK\("(\w+)"\)/g)];
            if (matches.length !== 1 || matches[0].length !== 2) {
                continue;
            }
            let fkTableName = matches[0][1];
            let targetTable = tables.find(table => table.head === fkTableName);
            if (! targetTable) { continue; }
            references.push(targetTable)
        }
        return references;
    }

    updateRelations(tables: Table[]) {
        let references = [];
        for (let tableRow of this.tableRows) {
            let matches = [...tableRow.attributes.join('').matchAll(/FK\("(\w+)"\)/g)];
            if (matches.length !== 1 || matches[0].length !== 2) {
                continue;
            }
            let fkTableName = matches[0][1];
            let targetTable = tables.find(table => table.head === fkTableName);
            if (! targetTable) { continue; }
            references.push(targetTable)
        }
        this.relations = references.map(x => new Relation(this, x));
    }

    updateTableCost(costGrid: CostGrid, worldSize: MyRect) {
        let tableRect = this.getContainingRect();
        let tableRectPaddingInnerRect = new MyRect(tableRect.x - 1, tableRect.y - 1, tableRect.width + 2, tableRect.height + 2);
        let tableRectPaddingOuterRect = new MyRect(tableRect.x - 2, tableRect.y - 2, tableRect.width + 4, tableRect.height + 4);
        let tableRectPaddingInnerPoints = tableRectPaddingInnerRect.toPoints()
            .filter((point) => 
                ! tableRect.contains(point.x, point.y) && 
                worldSize.contains(point.x, point.y)
            );
        let tableRectPaddingOuterPoints = tableRectPaddingOuterRect.toPoints()
            .filter((point) => 
                ! tableRectPaddingInnerRect.contains(point.x, point.y) && 
                worldSize.contains(point.x, point.y)    
            );
        tableRect.toPoints().filter(point => worldSize.contains(point.x, point.y)).forEach((point) => costGrid.value[point.y][point.x].push(CostGridTileTypes.WALL));
        tableRectPaddingInnerPoints.forEach((point) => costGrid.value[point.y][point.x].push(CostGridTileTypes.PADDINGINNER));
        tableRectPaddingOuterPoints.forEach((point) => costGrid.value[point.y][point.x].push(CostGridTileTypes.PADDINGOUTER));
    }
}