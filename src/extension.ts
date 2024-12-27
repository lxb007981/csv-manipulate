import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration('csv-manipulate');
const sep: string = config.get('separator') || ',';
const trimEnabled: boolean = config.get('trimEnabled') || true;

function parseSetInput(input: string): { row: string, col: string, target: string } {
	const [row, col, target] = input.split(sep);
	if (trimEnabled) {
		return {
			row: row.trim(),
			col: col.trim(),
			target: target.trim()
		};
	}
	return {
		row: row,
		col: col,
		target: target
	};
}

function parseGetInput(input: string): { row: string, col: string } {
	const [row, col] = input.split(sep);
	if (trimEnabled) {
		return {
			row: row.trim(),
			col: col.trim()
		};
	}
	return {
		row: row,
		col: col
	};
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

			/* input looks like: "libwireguard.so, some_random_col_name, Y"
			 * meaning: row, col, target cell value
			*/
			const { row, col, target } = parseSetInput(userResponse);
			/* search the currently opened csv file, find the target cell, and set the value */
			const colNumber = document.lineAt(0).text.split(sep).indexOf(col);
			if (colNumber === -1) {
				vscode.window.showErrorMessage(`col: ${col} not found`);
				return;
			}
			/* then get row number */
			let rowNumber = -1;
			document.getText().split('\n').find((line, index) => {
				const firstComma = line.indexOf(sep);
				if (firstComma !== -1 && line.substring(0, firstComma) === row) {
					rowNumber = index;
					return true;
				}
			});
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

			/* input looks like: "libwireguard.so, some_random_col_name"
			 * meaning: row, col
			*/
			const { row, col } = parseGetInput(userResponse);
			/* search the currently opened csv file, find the target cell, and set the value */

			/* first get the col number */
			const colNumber = document.lineAt(0).text.split(sep).indexOf(col);
			/* then get the target cell */
			document.getText().split('\n').find((line, _) => {
				const firstComma = line.indexOf(sep);
				if (firstComma !== -1 && line.substring(0, firstComma) === row) {
					vscode.window.showInformationMessage(`value: ${line.split(sep)[colNumber]}, row: ${row}, col: ${col}`);
					return true;
				}
			});

		}
	});
	context.subscriptions.push(setCellValueDisposable);
	context.subscriptions.push(getCellValueDisposable);
}