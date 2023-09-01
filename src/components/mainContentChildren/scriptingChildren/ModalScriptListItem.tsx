import { SetStateAction, useState } from "react";
import { Draw } from "../../../model/Draw";
import { Script } from "../../../model/LocalStorageData";
import { ModalScriptExecuteProps } from "./ModalScriptExecute";

export interface ModalScriptListItemProps {
    script: Script
    highlightedContent: string
    setScriptModalState: React.Dispatch<React.SetStateAction<boolean>>
    switchToExecuteModel: (scriptExecuteModalProps: ModalScriptExecuteProps) => void
    setExecuteModalState: React.Dispatch<React.SetStateAction<boolean>>
    setEditorValue: (content: string) => void
    removeScriptFromLocalStorage: (script: Script) => void
    executeWithLogAsync: (value: string, draw: Draw) => Promise<{ error: string; resultLog: string[]; }>
    draw: Draw
}


export default function ModalScriptListItem({
    script,
    highlightedContent,
    setScriptModalState,
    switchToExecuteModel,
    setExecuteModalState,
    setEditorValue,
    removeScriptFromLocalStorage,
    executeWithLogAsync,
    draw
}: ModalScriptListItemProps) {

    const execute = async (value: string, draw: Draw): Promise<ModalScriptExecuteProps> => {
        let executeResult = await executeWithLogAsync(value, draw);
        return {
            isSuccess: executeResult.error === "",
            content: executeResult.resultLog.join("\n"),
            setModalState: setExecuteModalState
        };
    }
    const onClickCopyToEditor = () => {
        setEditorValue(script.content)
        setScriptModalState(false);
    }
    const onClickDeleteScript = () => {
        removeScriptFromLocalStorage(script)
        setScriptModalState(false);
    }
    return (
        <>
            <div className="modal" tabIndex={-1} style={{ display: "block" }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <p className="modal-title">{script.name}</p>
                            <button type="button" className="btn-close" onClick={() => { setScriptModalState(false) }} aria-label="Close"></button>
                        </div>
                        <pre className="modal-body colored-code mb-0 p-2"
                            dangerouslySetInnerHTML={{ __html: highlightedContent }} />
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => { setScriptModalState(false) }}>Close</button>
                            {!script.tags.includes("builtin") &&
                                <button onClick={() => onClickDeleteScript()} type="button" className="btn btn-danger">Delete</button>
                            }

                            {!script.tags.includes("readonly") &&
                                <>
                                    <button onClick={async () => { switchToExecuteModel(await execute(script.content, draw)) }} type="button" className="btn btn-primary">⚡ Execute</button>
                                    <button onClick={() => onClickCopyToEditor()} type="button" className="btn btn-primary">Paste to editor</button>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </>
    );
}