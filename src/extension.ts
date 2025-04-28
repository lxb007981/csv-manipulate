import * as vscode from 'vscode';
import { CsvManipulatorViewProvider } from './csvManipulatorView';

const config = vscode.workspace.getConfiguration('csv-manipulate');
const sep: string = config.get('separator') || ',';
const trimEnabled: boolean = config.get('trimEnabled') || true;
const caseInsensitive: boolean = config.get('caseInsensitive') || true;

interface UserResponse {
	row: string;
	col: string;
	searchRow: number;
	searchCol: number;
	target: string;
	partialMatch: boolean
}

function setLastInput(context: vscode.ExtensionContext, userResponse: UserResponse): void {
	context.workspaceState.update('lastInput', userResponse);
}

function getLastInput(context: vscode.ExtensionContext): UserResponse | undefined {
	return context.workspaceState.get('lastInput');
}

function processSetInput(userSetInput: UserResponse): UserResponse {
	let res = userSetInput;
	if (trimEnabled) {
		res.row = res.row.trim();
		res.col = res.col.trim();
		res.target = res.target.trim();
	}
	if (caseInsensitive) {
		res.row = res.row.toLowerCase();
		res.col = res.col.toLowerCase();
		/* remember target must NOT be lowerCased() */
	}
	return res;
}

function isValidIndex(num: number) {
	return Number.isInteger(num) && num >= 1
}

/* unified entry for cli and gui */
function processGetInput(userGetInput: UserResponse): UserResponse {
	let res = userGetInput;
	if (trimEnabled) {
		res.row = res.row.trim();
		res.col = res.col.trim();
	}
	if (caseInsensitive) {
		res.row = res.row.toLowerCase();
		res.col = res.col.toLowerCase();
	}
	return res;
}

function getColNumber(document: vscode.TextDocument, col: string, searchRow: number, partialMatch: boolean): number {
	let colNumber = -1;
	document.lineAt(searchRow - 1).text.split(sep).find((cell, index) => {
		if (caseInsensitive) {
			cell = cell.toLowerCase();
		}
		if (partialMatch && cell.includes(col) || cell === col) {
			colNumber = index;
			return true;
		}
	});
	return colNumber;
}

/* by the target column, find the matching row, move cursor to the target, and perform callback */
function __doRow(editor: vscode.TextEditor, row: string, searchCol: number, callback: (line: string, index: number) => void, partialMatch: boolean): void {
	const document = editor.document;
	const lines = document.getText().split('\n')
	for (let index = 1; index < lines.length; index += 1) {
		const line = lines[index];
		let cellStart = 0;
		let cellEnd = 0;
		let curCol = 1;
		while (cellStart < line.length) {
			cellEnd = line.indexOf(sep, cellStart);
			if (cellEnd === -1) {
				cellEnd = line.length;
			}
			if (curCol == searchCol) {
				break;
			}
			cellStart = cellEnd + 1;
			curCol += 1
		}

		/* continue searching the next row */
		if (curCol != searchCol || cellStart >= line.length) {
			continue;
		}

		let searchedCell = line.substring(cellStart, cellEnd);
		if (caseInsensitive) {
			searchedCell = searchedCell.toLowerCase();
		}
		if (partialMatch && searchedCell.includes(row) || searchedCell === row) {
			callback(line, index);
			break;
		}
	}
}

function getRowNumber(editor: vscode.TextEditor, row: string, searchCol: number, partialMatch: boolean): number {
	let rowNumber = -1;
	__doRow(editor, row, searchCol, (_, index) => {
		rowNumber = index;
	}, partialMatch);
	return rowNumber;
}

function getCellValueAndSelection(document: vscode.TextDocument, rowNumber: number, colNumber: number): { cellVal: string, cellSelection: vscode.Selection } {
	let cellVal = '';
	let charCnt = 0;
	const targetRow = document.lineAt(rowNumber);
	/* find the cell start */
	targetRow.text.split(sep).find((cell, index) => {
		if (index === colNumber) {
			cellVal = cell;
			return true;
		}
		charCnt += cell.length + 1; /* +1 for the comma */
	});

	const targetCellStart = targetRow.range.start.translate({ characterDelta: charCnt });
	const targetCellEnd = targetCellStart.translate({ characterDelta: cellVal.length });
	const selection = new vscode.Selection(targetCellStart, targetCellEnd);
	return {
		cellVal: cellVal,
		cellSelection: selection
	}
}

async function setCellValue(editor: vscode.TextEditor, userResponse: { row: string, col: string, searchRow: number, searchCol: number, target: string, partialMatch: boolean }): Promise<void> {
	const { row, col, target, searchRow, searchCol, partialMatch } = userResponse;
	const document = editor.document;
	/* search the currently opened csv file, find the target cell, and set the value */
	const colNumber = getColNumber(document, col, searchRow, partialMatch);
	if (colNumber === -1) {
		vscode.window.showErrorMessage(`col: ${col} not found`);
		return;
	}

	/* then get row number */
	const rowNumber = getRowNumber(editor, row, searchCol, partialMatch);
	if (rowNumber === -1) {
		vscode.window.showErrorMessage(`row: ${row} not found`);
		return;
	}

	const { cellSelection } = getCellValueAndSelection(document, rowNumber, colNumber);

	await editor.edit(editBuilder => {
		editBuilder.replace(cellSelection, target);
	});
	await document.save();
	/* move cursor to the target cell */
	const targetCellStart = cellSelection.start;
	const newTargetCellEnd = targetCellStart.translate({ characterDelta: target.length });
	const newSelection = new vscode.Selection(targetCellStart, newTargetCellEnd);
	editor.selection = newSelection;
	editor.revealRange(newSelection);
	await vscode.window.showTextDocument(document, { preview: false, preserveFocus: false });
}

function getCellValue(editor: vscode.TextEditor, userResponse: { row: string, col: string, searchRow: number, searchCol: number, partialMatch: boolean }): string {
	const document = editor.document;
	const { row, col, searchRow, searchCol, partialMatch } = userResponse;
	/* search the currently opened csv file, find the target cell, and set the value */

	/* first get the col number */
	const colNumber = getColNumber(document, col, searchRow, partialMatch);
	if (colNumber === -1) {
		vscode.window.showErrorMessage(`col: ${col} not found`);
		return '';
	}

	/* then get row number */
	const rowNumber = getRowNumber(editor, row, searchCol, partialMatch);
	if (rowNumber === -1) {
		vscode.window.showErrorMessage(`row: ${row} not found`);
		return '';
	}

	/* then get the target cell */
	const { cellVal, cellSelection } = getCellValueAndSelection(document, rowNumber, colNumber);
	if (cellVal === '') {
		vscode.window.showErrorMessage(`cell: ${row}, ${col} not found`);
		return '';
	}
	vscode.window.showInformationMessage(`cell value: ${cellVal}`);
	/* move cursor to the target cell */
	editor.selection = cellSelection;
	editor.revealRange(cellSelection);
	vscode.window.showTextDocument(document, { preview: false, preserveFocus: false });
	return cellVal;
}

export function activate(context: vscode.ExtensionContext) {
	const csvManipulatorViewProvider = new CsvManipulatorViewProvider(context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(CsvManipulatorViewProvider.viewId, csvManipulatorViewProvider));
}

export { setCellValue, getCellValue, setLastInput, getLastInput, processSetInput, processGetInput, isValidIndex }