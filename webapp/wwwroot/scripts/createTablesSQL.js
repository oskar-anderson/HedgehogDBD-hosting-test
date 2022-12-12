let databaseName = `database_${dayjs().format('YYYYMMDDHHmm')}`;
console.log(`CREATE SCHEMA IF NOT EXISTS ${databaseName};`)
for (let table of schema.tables) {
    let rows = [];
    for (let row of table.tableRows) {
        let datatype = row.datatype.slice(-1) === "?" ? `${row.datatype.slice(0, -1)} NOT NULL` : row.datatype;
        rows.push(`${row.name} ${datatype}`);
    }
    for (let row of table.tableRows) {
        if (row.attributes.includes("PK")) {
            rows.push(`CONSTRAINT PK_${table.head}__${row.name} PRIMARY KEY (${row.name})`);
        }
    }
    for (let row of table.tableRows) {
        let matches = [...row.attributes.join('').matchAll(/FK\("(\w+)"\)/g)];
        if (matches.length !== 1 || matches[0].length !== 2) {
            continue;
        }
        let fkTableName = matches[0][1];
        let fkPkField = schema.tables.find(table => table.head === fkTableName).tableRows.find(row => row.attributes.includes('PK')).name;
        rows.push(`CONSTRAINT FK_${table.head}__${row.name}__${fkTableName}__${fkPkField} FOREIGN KEY (${row.name}) REFERENCES ${fkTableName}(${fkPkField})`);
    }
    console.log(
`CREATE TABLE IF NOT EXISTS ${databaseName}.${table.head} (
    ${rows.map((row) => { return row }).join(",\n    ")}
)
ENGINE = InnoDB
DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_bin;
`
    );
}