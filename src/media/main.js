const vscode = acquireVsCodeApi();

document.getElementById('csv-manipulate-get-button').addEventListener('click', () => {
	const row = document.getElementById('csv-manipulate-row').value;
	const col = document.getElementById('csv-manipulate-col').value;
	const searchRow = document.getElementById('csv-manipulate-search-row').value || 1;
	const searchCol = document.getElementById('csv-manipulate-search-col').value || 1;
	vscode.postMessage({
		command: 'csv-manipulate-get',
		userResponse: {
			row: row,
			col: col,
			searchRow: searchRow,
			searchCol: searchCol
		}
	});
});

document.getElementById('csv-manipulate-set-button').addEventListener('click', () => {
	const row = document.getElementById('csv-manipulate-row').value;
	const col = document.getElementById('csv-manipulate-col').value;
	const searchRow = document.getElementById('csv-manipulate-search-row').value || 1;
	const searchCol = document.getElementById('csv-manipulate-search-col').value || 1;
	const target = document.getElementById('csv-manipulate-target').value;
	vscode.postMessage({
		command: 'csv-manipulate-set',
		userResponse: {
			row: row,
			col: col,
			searchRow: searchRow,
			searchCol: searchCol,
			target: target
		}
	});
});

window.addEventListener('message', event => {
	const message = event.data;
	const row = document.getElementById('csv-manipulate-row');
	const col = document.getElementById('csv-manipulate-col');
	const searchRow = document.getElementById('csv-manipulate-search-row');
	const searchCol = document.getElementById('csv-manipulate-search-col');
	const target = document.getElementById('csv-manipulate-target');
	switch (message.command) {
		case 'csv-manipulate-get':
			target.value = message.cellValue;
			break;
		case 'csv-manipulate-last-input':
			const lastInputVals = message.lastInput.split(',');
			row.value = lastInputVals[0].trim();
			col.value = lastInputVals[1].trim();
			searchRow.value = lastInputVals[2].trim();
			searchCol.value = lastInputVals[3].trim();
			if (lastInputVals.length > 4) {
				target.value = lastInputVals[4].trim();
			}
			break;
	}
});