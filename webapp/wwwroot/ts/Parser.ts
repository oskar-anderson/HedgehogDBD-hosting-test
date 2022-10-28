import { Rectangle } from "pixi.js";
import { Table } from "./model/Table";
import { TableRow } from "./model/TableRow";

export class Parser {
    constructor() {

    }

    parse(schema: string) {
        let rows = schema.split('\n');
        let width = Math.max(...(rows.map(el => el.length)));
        let height = rows.length;
        console.log("xMax: " + width);
        console.log("yMax: " + height);

        let board: string[] = new Array(width * height);
        board.fill(" ");
        for (let y = 0; y < rows.length; y++) {
            let row = rows[y];
            for (let x = 0; x < row.length; x++) {
                board[y * width + x] = row[x];
            }
        }
        console.log(board);

        let tables: Table[] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let tile = board[y * width + x];
                if (tile === "+" && 
                    ! tables.some(
                        function(table) { 
                            return table.rect.contains(x, y);
                        }
                    )
                ) {
                    let possibleTable = new Table(new Rectangle(x, y, 0, 0), "", []);
                    let a = 0;
                    while (a < width - x) {
                        if (["|", "+"].includes(board[y * width + x + a])) {
                            if (x + a + 1 < width && board[y * width + x + a + 1] === " ") {
                                possibleTable.rect.width = a + 1;
                                break;
                            }
                        }
                        a++;
                    }
                    a = 0;
                    while (a < height - y && possibleTable.rect.width != 0) {
                        if (["|", "+"].includes(board[(y + a) * width + x])) {
                            if (y + a + 1 < height && board[(y + a + 1) * width + x] === " ") {
                                possibleTable.rect.height = a + 1;
                                break;
                            }
                        }
                        a++;
                    }
                    if (possibleTable.rect.width != 0 && possibleTable.rect.height != 0) {
                        tables.push(possibleTable)
                    }
                }
            }
        }

        for (let table of tables) {
            let tableSpec = board.slice(
                (table.rect.y + 1) * width + table.rect.left + 1, 
                (table.rect.y + 1) * width + table.rect.right - 1)
                .join("").trim();
            table.head = tableSpec.split(":")[0];
            for (let cy = table.rect.y + 3; cy < table.rect.bottom - 1; cy++) {
                let row = board.slice(
                    (cy) * width + table.rect.left + 1, 
                    (cy) * width + table.rect.right - 1)
                    .join("").trim();
                let columns = row.split("|").map(function(item) { return item.trim(); });
                let attributeList = columns[2].split(',').map(x => x.trim());
                table.tableRows.push(new TableRow(columns[0], columns[1], attributeList));
            }
        }


        return tables;
    }
}