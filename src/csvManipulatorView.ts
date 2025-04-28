import * as vscode from 'vscode';
import { setCellValue, getCellValue, setLastInput, getLastInput, processSetInput, processGetInput, isValidIndex } from './extension';

class CsvManipulatorViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewId = 'csv-manipulate-view';
	private readonly _extensionUri: vscode.Uri;
	private _view?: vscode.WebviewView;
	private _extensionContext: vscode.ExtensionContext;
	constructor(extensionContext: vscode.ExtensionContext) {
		this._extensionUri = extensionContext.extensionUri;
		this._extensionContext = extensionContext;
	}
	public resolveWebviewView(webviewView: vscode.WebviewView) {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri]
		};
		this._view = webviewView;
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		webviewView.webview.onDidReceiveMessage(message => {
			const activeEditor = vscode.window.activeTextEditor;
			if (!activeEditor) {
				vscode.window.showErrorMessage('No active editor found');
				return;
			}
			if (!this._view) {
				return;
			}
			setLastInput(this._extensionContext, message.userResponse);
			let searchRow = 1;
			if (message.userResponse.searchRow) {
				searchRow = Number(message.userResponse.searchRow);
				if (!isValidIndex(searchRow)) {
					vscode.window.showErrorMessage('Invalid search row');
					return;
				}
			}

			let searchCol = 1;
			if (message.userResponse.searchCol) {
				searchCol = Number(message.userResponse.searchCol);
				if (!isValidIndex(searchCol)) {
					vscode.window.showErrorMessage('Invalid search col');
					return;
				}
			}

			switch (message.command) {
				case 'csv-manipulate-get':
					this._view.webview.postMessage({
						command: 'csv-manipulate-get',
						cellValue: getCellValue(activeEditor, processGetInput(message.userResponse))
					});
					break;
				case 'csv-manipulate-set':
					setCellValue(activeEditor, processSetInput(message.userResponse))
					break;
			}
		});
		webviewView.onDidChangeVisibility(() => {
			this._updateWebview();
		});
		this._updateWebview();
	}
	private _updateWebview() {
		if (!this._view || !this._view.visible) {
			return;
		}
		this._view.webview.postMessage({
			command: 'csv-manipulate-last-input',
			lastInput: getLastInput(this._extensionContext)
		});

	}
	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'media', 'main.js'));
		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'media', 'main.css'));
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet">
				<title>CSV Manipulator</title>
			</head>
			<body>
				<div id="root">
					<div>
						<input type="text" id="csv-manipulate-row" placeholder="row">
						<label> 纵坐标</label>
						<input type="text" id="csv-manipulate-col" placeholder="col">
						<label> 横坐标</label>
					</div>
					<div>
						<input type="text" id="csv-manipulate-search-row" placeholder="1">
						<label> 搜索第x行，默认为1</label>
					</div>
					<div>
						<input type="text" id="csv-manipulate-search-col" placeholder="1">
						<label> 搜索第y列，默认为1</label>
					</div>
					<div>
						<input type="text" id="csv-manipulate-target" placeholder="target">
						<button id="csv-manipulate-get-button">Get</button>
						<button id="csv-manipulate-set-button">Set</button>
					</div>
					<div>
						<input type="checkbox" id="csv-manipulate-partial-match" checked />
						<label for="csv-manipulate-partial-match"> 部分匹配</label>
					</div>
				</div>
				<script src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

export { CsvManipulatorViewProvider };