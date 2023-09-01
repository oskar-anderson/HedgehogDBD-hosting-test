import { ChangeEvent, FormEvent, HTMLProps, useRef, useState } from "react"
import DataType, { IDataTypeArgument } from "../../../model/DataTypes/DataType"
import { IDataType } from "../../../model/DataTypes/IDataType";
import { OverlayTrigger, Popover } from "react-bootstrap";
import EnvGlobals from "../../../../EnvGlobals";
import { MyRect } from "../../../model/MyRect";
import Database from "../../../model/DataTypes/Database";


interface UiTableRowDatatype {
    id: string,
    arguments: {
        value: {
            isIncluded: boolean,
            realValue: number,
        },
        argumentId: string
    }[],
    isNullable: boolean
}

export interface TableRowProps extends HTMLProps<HTMLTableRowElement> {
    index: number,
    hoverInsertIndicator: React.RefObject<HTMLDivElement>,
    dragItem: React.MutableRefObject<number | null>,
    dragOverItem: React.MutableRefObject<number | null>,
    row: {
        rowName: string
        rowDatatype: UiTableRowDatatype
        rowAttributes: string
    },
    tableRows: {  // I think this cannot be named rows because of a collision with some attribute of type number named rows or _rows
        key: string; // this is only needed in the parent component to manage state on new row insertion
        rowName: string;
        rowDatatype: UiTableRowDatatype;
        rowAttributes: string;
    }[],
    setRows: React.Dispatch<React.SetStateAction<{
        key: string;
        rowName: string;
        rowDatatype: UiTableRowDatatype;
        rowAttributes: string;
    }[]>>,
    deleteRow: (index: number) => void,
    database: Database
}


export default function TableRow({ index, hoverInsertIndicator, dragItem, dragOverItem, row, setRows, tableRows, deleteRow, database, ...restProps}: TableRowProps) {
    const [datatypeArguments, setDatatypeArguments] = useState<{
        value: string;
        displayName: string;
        id: string;
        isReadonly: boolean;
        isIncluded: boolean;
        typeId: string;
    }[]>(row.rowDatatype.arguments
        .map(x => {
            const argument = DataType.getArgumentById(x.argumentId);
            return {
                displayName: argument.displayName,
                isReadonly: argument.isReadonly,
                isIncluded: x.value.isIncluded,
                id: argument.id,
                typeId: argument.typeId,
                value: String(x.value.realValue)
            }
        })
    );

    const handleArgumentInputChange = (e: ChangeEvent, argumentId: string) => {
        const newValue = (e.target! as HTMLInputElement).value;
        const newArguments = [...datatypeArguments];
        const argumentToUpdate = newArguments.find(arg => arg.id === argumentId)!;
        const isContainingOnlyDigits = (value: string) => /^[0-9]+$/.test(value);
        if (!isContainingOnlyDigits(newValue)) { return };
        const newDataTypeArgumentValueNumber = Number.parseInt(newValue);
        argumentToUpdate.value = String(newDataTypeArgumentValueNumber)
        setDatatypeArguments(newArguments);
        const rowsCopy = [...tableRows];
        rowsCopy[index].rowDatatype.arguments = newArguments.map(x => {
            return {
                value: {
                    isIncluded: x.isIncluded,
                    realValue: newDataTypeArgumentValueNumber,
                },
                argumentId: x.id
            }
        });
        setRows(rowsCopy);
    }

    const handleSelectInputOnChange = (e: ChangeEvent) => {
        const selectedDatatypeId = (e.target as HTMLSelectElement).value;
        const args = DataType.getArgumentsByDatabaseAndByType(database.select, selectedDatatypeId)
        
        const dataTypeArguements = args.map(x => ({
            displayName: x.displayName,
            isReadonly: x.isReadonly,
            isIncluded: true,
            id: x.id,
            typeId: x.typeId,
            value: String(x.defaultValue),
        }))
        setDatatypeArguments(dataTypeArguements);
        const rowsCopy = [...tableRows];
        const newArguments = DataType.getArgumentsByDatabaseAndByType(database.select, selectedDatatypeId);
        const rowCopy = rowsCopy[index];
        rowCopy.rowDatatype = {
            id: selectedDatatypeId,
            arguments: newArguments.map(x => {
                return {
                    value: {
                        isIncluded: x.isIncluded,
                        realValue: x.defaultValue,
                    },
                    argumentId: x.id
                }
            }),
            isNullable: rowCopy.rowDatatype.isNullable
        };
        setRows(rowsCopy);
    }

    const handleArgumentWillNotBeProvidedCheckbox = (isChecked: boolean) => {
        const newArgs = [...datatypeArguments];
        // every field has to be included or excluded as to not mess up the argument order
        newArgs.map(x => x.isIncluded = isChecked);
        setDatatypeArguments(newArgs);
        const rowsCopy = [...tableRows];
        rowsCopy[index].rowDatatype.arguments.map(x => x.value.isIncluded = isChecked);
        setRows(rowsCopy);
    }

    const handleAttributeChange = (newValue: string) => {
        const rowsCopy = [...tableRows];
        rowsCopy[index].rowAttributes = newValue;
        setRows(rowsCopy);
    }

    const popover = (
        <Popover style={{ padding: "12px" }}>
            <input id="inputIncludeCustomArguments" style={{ marginRight: "6px" }} type="checkbox"
                onChange={(e) => { handleArgumentWillNotBeProvidedCheckbox((e.target as HTMLInputElement).checked) }} 
                defaultChecked={true}
            />
            <label htmlFor="inputIncludeCustomArguments">Include optional arguments</label>
            {datatypeArguments.map((argument) => {
                return (
                    <div key={argument.id} style={{ display: "flex", alignItems: "center", marginTop: "0.5em" }}>
                        <span style={{ paddingRight: "0.5em" }}>{argument.displayName}: </span>
                        <input style={{ width: "100%" }} type="text" className="form-control"
                            onChange={(e) => handleArgumentInputChange(e, argument.id)}
                            value={argument.isIncluded ? argument.value : "Omited"}
                            title={argument.isReadonly ? "Readonly" : undefined}
                            disabled={argument.isReadonly || !argument.isIncluded}
                        />
                    </div>
                )
            })}
        </Popover>
    )


    const tableRowRef = useRef<HTMLTableRowElement>(null);

    return (
        <tr {...restProps} ref={tableRowRef}
            onMouseMove={(e) => { 
                if (dragItem.current === null) { return; }
                const tableRowRect = tableRowRef.current!.getBoundingClientRect();
                const upperHalf = new MyRect(tableRowRect.x, tableRowRect.y, tableRowRect.width, tableRowRect.height / 2);
                const lowerHalf = new MyRect(tableRowRect.x, tableRowRect.y + tableRowRect.height / 2, tableRowRect.width, tableRowRect.height / 2);
                let extraHeightForBottomIndicator = 0;
                if (dragItem.current > index) { // dragging up
                    if (upperHalf.contains(e.clientX, e.clientY)) {
                        dragOverItem.current = index;
                    } else {
                        dragOverItem.current = index + 1;
                        extraHeightForBottomIndicator = tableRowRect.height;
                    }
                } else if (dragItem.current === index) {
                    hoverInsertIndicator.current!.style.display = "none";
                    return;
                } else { // dragging down
                    if (lowerHalf.contains(e.clientX, e.clientY)) {
                        dragOverItem.current = index;
                        extraHeightForBottomIndicator = tableRowRect.height;
                    } else {
                        dragOverItem.current = index - 1;
                    }
                }

                hoverInsertIndicator.current!.style.display = "flex";
                hoverInsertIndicator.current!.style.width = `${tableRowRef.current!.offsetWidth}px`;
                hoverInsertIndicator.current!.style.top = `${tableRowRect.top + extraHeightForBottomIndicator - hoverInsertIndicator.current!.clientHeight / 2}px`;
                hoverInsertIndicator.current!.style.left = `${tableRowRect.left + (tableRowRect.width / 2) - hoverInsertIndicator.current!.clientWidth / 2}px`;
            }}
        >
            <td>
                <button
                    className="btn btn-light btn-icon"
                    onMouseDown={(e) => { dragItem.current = index; }}
                >
                    <img draggable="false" style={{ userSelect: "none" }} data-bs-toggle="tooltip" data-bs-placement="bottom" title="drag"
                        width={28} height={28} src={EnvGlobals.BASE_URL + "/wwwroot/img/icons/drag.png"} alt="drag" />
                </button>
            </td>
            <td>
                <input className="form-control" style={{ display: "inline" }} onChange={(e) => {
                    const rowsCopy = [...tableRows];
                    rowsCopy[index].rowName = (e.target as HTMLInputElement).value
                    setRows(rowsCopy);
                }} type="text" value={row.rowName} />
            </td>
            <td style={{ width: "math(220px + 320px)"}}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <select style={{ width: "180px", textOverflow: "ellipsis" }}
                        className={"form-select" + ` ${row.rowDatatype.id}`}
                        name="input-datatype"
                        onChange={handleSelectInputOnChange}
                        value={row.rowDatatype.id }
                    >
                        {DataType.getTypes().map(x => {
                            let selectedOptionDisplayParameters = "";
                            if (x.getId() === row.rowDatatype.id) {
                                const selectedDataTypeArguments = datatypeArguments.filter(x => x.isIncluded);
                                selectedOptionDisplayParameters = (selectedDataTypeArguments.length !== 0) ? 
                                    `(${selectedDataTypeArguments.map(x => x.value).join(", ")})` : 
                                    "";
                            } else {
                                const notSelectedDataTypeArguments = DataType.getArgumentsByDatabaseAndByType(database.select, x.getId());
                                selectedOptionDisplayParameters = (notSelectedDataTypeArguments.length !== 0) ? 
                                    `(${notSelectedDataTypeArguments.map(x => x.defaultValue).join(", ")})` :
                                    "";
                            }

                            return (
                                <option key={x.getId()} value={x.getId()}>{x.getSelectListName() + selectedOptionDisplayParameters}</option>
                            )
                        })}
                    </select>
                    <button className="btn btn-light btn-icon"
                        onClick={() => {
                            const rowsCopy = [...tableRows];
                            rowsCopy[index].rowDatatype.isNullable = ! row.rowDatatype.isNullable;
                            setRows(rowsCopy);
                        }}>
                        {row.rowDatatype.isNullable ? "?" : "!"}
                    </button>
                    <OverlayTrigger trigger="click" placement="right" overlay={popover} rootClose={true}>
                        <button className={`btn btn-light btn-icon ${datatypeArguments.length === 0 ? "disabled" : ""}`} disabled={datatypeArguments.length === 0}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                            </svg>
                        </button>
                    </OverlayTrigger>
                </div>
            </td>
            <td>
                <input className="form-control" style={{ display: "inline" }} list="attribute-suggestions" type="text" value={row.rowAttributes}
                    onChange={(e) => handleAttributeChange((e.target as HTMLInputElement).value) }
                />
            </td>
            <td>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    <button className="row-delete-btn btn btn-danger" onClick={(e) => deleteRow(index)}>Delete</button>
                </div>
            </td>
        </tr>
    )
}