import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration('csv-manipulate');
const sep: string = config.get('separator') || ',';
const trimEnabled: boolean = config.get('trimEnabled') || true;
const partialMatch: boolean = config.get('partialMatch') || true;
const caseInsensitive: boolean = config.get('caseInsensitive') || true;

function parseSetInput(input: string): { row: string, col: string, target: string } {
	let [row, col, target] = input.split(sep);
	if (trimEnabled) {
		row = row.trim();
		col = col.trim();
		target = target.trim();
	}
	if (caseInsensitive) {
		row = row.toLowerCase();
		col = col.toLowerCase();
		target = target.toLowerCase();
	}
	return {
		row: row,
		col: col,
		target: target
	};
}

function parseGetInput(input: string): { row: string, col: string } {
	let [row, col] = input.split(sep);
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

function __doRow(document: vscode.TextDocument, row: string, callback: (line: string, index: number) => void): void {
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

function getRowNumber(document: vscode.TextDocument, row: string): number {
	let rowNumber = -1;
	__doRow(document, row, (_, index) => {
        rowNumber = index;
    });
	return rowNumber;
}

function getCellValue(document: vscode.TextDocument, row: string, colNumber: number): string {
	let cellVal = '';
	__doRow(document, row, (line, _) => {
        cellVal = line.split(sep)[colNumber];
    });
	return cellVal;
}

export function activate(context: vscode.ExtensionContext) {
	const setCellValueDisposable = vscode.commands.registerCommand('extension.setCell', async function () {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;

			const userResponse = await vscode.window.showInputBox({
				placeHolder: 'row name, col name, cell value'
			});

			if (!userResponse) {
				return;
			}

			/* input looks like: "SOME_RANDOM_ROW_NAME, some_random_col_name, Y"
			 * meaning: row, col, target cell value
			*/
			const { row, col, target } = parseSetInput(userResponse);
			/* search the currently opened csv file, find the target cell, and set the value */

			const colNumber = getColNumber(document, col);
			if (colNumber === -1) {
				vscode.window.showErrorMessage(`col: ${col} not found`);
				return;
			}

			/* then get row number */
			const rowNumber = getRowNumber(document, row);
			if (rowNumber === -1) {
				vscode.window.showErrorMessage(`row: ${row} not found`);
				return;
			}

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


			await editor.edit(editBuilder => {
				editBuilder.replace(selection, target);
			});
			await document.save();
		}
	});

	const getCellValueDisposable = vscode.commands.registerCommand('extension.getCell', async function () {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;

			const userResponse = await vscode.window.showInputBox({
				placeHolder: 'row name, col name'
			});

			if (!userResponse) {
				return;
			}

			/* input looks like: "SOME_RANDOM_ROW_NAME, some_random_col_name"
			 * meaning: row, col
			*/
			const { row, col } = parseGetInput(userResponse);
			/* search the currently opened csv file, find the target cell, and set the value */

			/* first get the col number */
			const colNumber = getColNumber(document, col);
			/* then get the target cell */
			const cellVal = getCellValue(document, row, colNumber);
			if (cellVal === '') {
				vscode.window.showErrorMessage(`cell: ${row}, ${col} not found`);
				return;
			}
			vscode.window.showInformationMessage(`cell value: ${cellVal}`);
		}
	});
	context.subscriptions.push(setCellValueDisposable);
	context.subscriptions.push(getCellValueDisposable);
}