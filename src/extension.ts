import * as vscode from 'vscode';
import { CsvManipulatorViewProvider } from './csvManipulatorView';

const config = vscode.workspace.getConfiguration('csv-manipulate');
const sep: string = config.get('separator') || ',';
const trimEnabled: boolean = config.get('trimEnabled') || true;
const caseInsensitive: boolean = config.get('caseInsensitive') || true;
let csvManipulatorViewProvider: CsvManipulatorViewProvider | undefined;
interface UserResponse {
	row: string;
	col: string;
	searchRow: number;
	searchCol: number;
	target: string;
	partialMatch: boolean;
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

function getColNumbers(document: vscode.TextDocument, col: string, searchRow: number, partialMatch: boolean): number[] {
	let res: number[] = [];
	const headers = document.lineAt(searchRow - 1).text.split(sep);
	for (let index = 1; index < headers.length; index += 1) {
		let cell = headers[index];
		if (caseInsensitive) {
			cell = cell.toLowerCase();
		}
		if (partialMatch && cell.includes(col) || cell === col) {
			res.push(index);
		}
	};
	return res;
}

/* by the target column, find the matching row(s) */
function getRowNumbers(document: vscode.TextDocument, row: string, searchCol: number, partialMatch: boolean): number[] {
	const lines = document.getText().split('\n')
	const rowNumbers: number[] = [];
	for (let index = 1; index < lines.length; index += 1) {
		const line = lines[index];
		let cellStart = 0;
		let cellEnd = 0;
		let curCol = 1;

		/* jump to the target column */
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
			rowNumbers.push(index);
		}
	}
	return rowNumbers;
}

function findCellValueAndSelection(document: vscode.TextDocument, rowNumber: number, colNumber: number): { cellVal: string, cellSelection: vscode.Selection } {
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

function tryGetColNumberAndRowNumber(document: vscode.TextDocument, userResponse: UserResponse): { rowNumber: number, colNumber: number } | undefined {
	const { row, col, searchRow, searchCol, partialMatch } = userResponse;
	const colNumbers = getColNumbers(document, col, searchRow, partialMatch);
	if (colNumbers.length === 0) {
		vscode.window.showErrorMessage(`col: ${col} not found`);
		return;
	}

	/* then get row number */
	const rowNumbers = getRowNumbers(document, row, searchCol, partialMatch);
	if (rowNumbers.length === 0) {
		vscode.window.showErrorMessage(`row: ${row} not found`);
		return;
	}

	if (rowNumbers.length > 1 || colNumbers.length > 1) {
		plotResultTable(document, rowNumbers, colNumbers, searchCol, searchRow);
		return;
	}

	return { rowNumber: rowNumbers[0], colNumber: colNumbers[0] };
}

async function setCellValue(editor: vscode.TextEditor, userResponse: UserResponse): Promise<void> {
	const document = editor.document;
	/* search the currently opened csv file, find the target cell, and set the value */
	const rowNumberAndColNumber = tryGetColNumberAndRowNumber(document, userResponse);
	if (!rowNumberAndColNumber) {
		return;
	}
	const { rowNumber, colNumber } = rowNumberAndColNumber;
	/* Now we know there is only one match. Go set the target cell */
	const { cellSelection } = findCellValueAndSelection(document, rowNumber, colNumber);
	const { target } = userResponse;

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

function getCellValue(editor: vscode.TextEditor, userResponse: UserResponse): string {
	const document = editor.document;
	const { row, col } = userResponse;
	/* search the currently opened csv file, find the target cell */
	const rowNumberAndColNumber = tryGetColNumberAndRowNumber(document, userResponse);
	if (!rowNumberAndColNumber) {
		return '';
	}

	/* Now we know there is only one match. Go get the target cell */
	const { rowNumber, colNumber } = rowNumberAndColNumber;
	const { cellVal, cellSelection } = findCellValueAndSelection(document, rowNumber, colNumber);
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

/* Note: rowNumbers and colNumbers are 0-based, increasing index. searchCol and searchRow are 1-based indices */
function plotResultTable(document: vscode.TextDocument, rowNumbers: number[], colNumbers: number[], searchCol: number, searchRow: number) {
	/* first find all matches and generate html */
	let html = "<p>找到多个匹配</p>"
	html += '<table>';

	// 1. Create Table Header (<thead>)
	html += '<thead><tr>';
	html += '<th></th>'; // Empty top-left corner cell
	const headers = document.lineAt(searchRow - 1).text.split(sep);
	for (const colNum of colNumbers) {
		const colName = headers[colNum];
		html += `<th>C${colNum + 1}: ${colName}</th>`;
	}
	html += '</tr></thead>';
	html += '<tbody>';
	for (const rowNum of rowNumbers) {
		html += '<tr>';
		const targetRowCells = document.lineAt(rowNum).text.split(sep);
		const rowName = targetRowCells[searchCol - 1]; // Get the row name from the search column
		html += `<th>L${rowNum + 1}: ${rowName}</th>`; // Row header cell

		for (const colNum of colNumbers) {
			const cellValue = targetRowCells[colNum];
			html += `<td>${cellValue}</td>`;
		}
		html += '</tr>';
	}
	html += '</tbody>';
	html += '</table>';
	csvManipulatorViewProvider?.plotAllMatchesTable(html);
}

export function activate(context: vscode.ExtensionContext) {
	csvManipulatorViewProvider = new CsvManipulatorViewProvider(context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(CsvManipulatorViewProvider.viewId, csvManipulatorViewProvider));
}

export { setCellValue, getCellValue, setLastInput, getLastInput, processSetInput, processGetInput, isValidIndex }