import * as vscode from 'vscode';
import { CsvManipulatorViewProvider } from './csvManipulatorView';

const config = vscode.workspace.getConfiguration('csv-manipulate');
const sep: string = config.get('separator') || ',';
const trimEnabled: boolean = config.get('trimEnabled') || true;
const partialMatch: boolean = config.get('partialMatch') || true;
const caseInsensitive: boolean = config.get('caseInsensitive') || true;

function setLastInput(context: vscode.ExtensionContext, input: string): void {
	context.workspaceState.update('lastInput', input);
}

function getLastInput(context: vscode.ExtensionContext): string {
	return context.workspaceState.get('lastInput', '');
}

function processSetInput(row: string, col: string, target: string): { row: string, col: string, target: string } {
	if (trimEnabled) {
		row = row.trim();
		col = col.trim();
		target = target.trim();
	}
	if (caseInsensitive) {
		row = row.toLowerCase();
		col = col.toLowerCase();
		/* remember target must not be lowerCased() */
	}
	return {
		row: row,
		col: col,
		target: target
	};
}

function parseSetInput(input: string): { row: string, col: string, target: string } {
	/* input looks like: "SOME_RANDOM_ROW_NAME, some_random_col_name, Y"
	 * meaning: row, col, target cell value
	*/
	let [row, col, target] = input.split(sep);
	return processSetInput(row, col, target);
}

function processGetInput(row: string, col: string): { row: string, col: string } {
	if (trimEnabled) {
		row = row.trim();
		col = col.trim();
	}
	if (caseInsensitive) {
		row = row.toLowerCase();
		col = col.toLowerCase();
	}
	return {
		row: row,
		col: col
	};
}

function parseGetInput(input: string): { row: string, col: string } {
	/* input looks like: "SOME_RANDOM_ROW_NAME, some_random_col_name"
	 * meaning: row, col
	*/
	let [row, col] = input.split(sep);
	return processGetInput(row, col);
}

function getColNumber(document: vscode.TextDocument, col: string): number {
	let colNumber = -1;
	document.lineAt(0).text.split(sep).find((cell, index) => {
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

/* find the matching row, move cursor to the target, and perform callback */
function __doRow(editor: vscode.TextEditor, row: string, callback: (line: string, index: number) => void): void {
	const document = editor.document;
	document.getText().split('\n').find((line, index) => {
		const firstComma = line.indexOf(sep);
		if (firstComma !== -1) {
			let firstCell = line.substring(0, firstComma);
			if (caseInsensitive) {
				firstCell = firstCell.toLowerCase();
			}
			if (partialMatch && firstCell.includes(row) || firstCell === row) {
				callback(line, index);
				return true;
			}
		}
	});
}

function getRowNumber(editor: vscode.TextEditor, row: string): number {
	let rowNumber = -1;
	__doRow(editor, row, (_, index) => {
		rowNumber = index;
	});
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

async function setCellValue(editor: vscode.TextEditor, userResponse: { row: string, col: string, target: string }): Promise<void> {
	const { row, col, target } = userResponse;
	const document = editor.document;
	/* search the currently opened csv file, find the target cell, and set the value */
	const colNumber = getColNumber(document, col);
	if (colNumber === -1) {
		vscode.window.showErrorMessage(`col: ${col} not found`);
		return;
	}

	/* then get row number */
	const rowNumber = getRowNumber(editor, row);
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
}

function getCellValue(editor: vscode.TextEditor, userResponse: { row: string, col: string }): string {
	const document = editor.document;
	const { row, col } = userResponse;
	/* search the currently opened csv file, find the target cell, and set the value */

	/* first get the col number */
	const colNumber = getColNumber(document, col);
	if (colNumber === -1) {
		vscode.window.showErrorMessage(`col: ${col} not found`);
		return '';
	}

	/* then get row number */
	const rowNumber = getRowNumber(editor, row);
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
	return cellVal;
}

async function setCellCommandCallback(context: vscode.ExtensionContext) {
	// Get the active text editor
	const editor = vscode.window.activeTextEditor;

	if (!editor) {
		vscode.window.showErrorMessage('No active text editor found');
		return;
	}
	const lastInput = getLastInput(context);
	const userResponse = await vscode.window.showInputBox({
		placeHolder: 'row name, col name, cell value',
		value: lastInput
	});

	if (!userResponse) {
		return;
	}

	setLastInput(context, userResponse);
	await setCellValue(editor, parseSetInput(userResponse))
}

async function getCallCommandCallback(context: vscode.ExtensionContext) {
	// Get the active text editor
	const editor = vscode.window.activeTextEditor;

	if (!editor) {
		vscode.window.showErrorMessage('No active text editor found');
		return;
	}

	const lastInput = getLastInput(context);
	const userResponse = await vscode.window.showInputBox({
		placeHolder: 'row name, col name',
		value: lastInput
	});

	if (!userResponse) {
		return;
	}

	setLastInput(context, userResponse);
	getCellValue(editor, parseGetInput(userResponse));
}

export function activate(context: vscode.ExtensionContext) {
	const setCellValueDisposable = vscode.commands.registerCommand('extension.setCell', setCellCommandCallback.bind(null, context));
	const getCellValueDisposable = vscode.commands.registerCommand('extension.getCell', getCallCommandCallback.bind(null, context));

	context.subscriptions.push(setCellValueDisposable, getCellValueDisposable);

	const csvManipulatorViewProvider = new CsvManipulatorViewProvider(context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(CsvManipulatorViewProvider.viewId, csvManipulatorViewProvider));
}

export { setCellValue, getCellValue, setLastInput, getLastInput, processSetInput, processGetInput }