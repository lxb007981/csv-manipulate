const vscode = acquireVsCodeApi();

function getUserResponse(requireTarget) {
	const row = document.getElementById('csv-manipulate-row').value;
	const col = document.getElementById('csv-manipulate-col').value;
	const searchRow = document.getElementById('csv-manipulate-search-row').value || 1;
	const searchCol = document.getElementById('csv-manipulate-search-col').value || 1;
	const partialMatch = document.getElementById('csv-manipulate-partial-match').checked;
	let res = {
		row: row,
		col: col,
		searchRow: Number(searchRow),
		searchCol: Number(searchCol),
		target: "",
		partialMatch
	}
	if (requireTarget) {
		res.target = document.getElementById('csv-manipulate-target').value;
	}
	return res;
}

document.getElementById('csv-manipulate-get-button').addEventListener('click', () => {
	vscode.postMessage({
		command: 'csv-manipulate-get',
		userResponse: getUserResponse(requireTarget = false)
	});
});

document.getElementById('csv-manipulate-set-button').addEventListener('click', () => {
	vscode.postMessage({
		command: 'csv-manipulate-set',
		userResponse: getUserResponse(requireTarget = true)
	});
});

window.addEventListener('message', event => {
	const message = event.data;
	const row = document.getElementById('csv-manipulate-row');
	const col = document.getElementById('csv-manipulate-col');
	const searchRow = document.getElementById('csv-manipulate-search-row');
	const searchCol = document.getElementById('csv-manipulate-search-col');
	const target = document.getElementById('csv-manipulate-target');
	const partialMatch = document.getElementById('csv-manipulate-partial-match');
	switch (message.command) {
		case 'csv-manipulate-get':
			target.value = message.cellValue;
			break;
		case 'csv-manipulate-last-input':
			const lastInput = message.lastInput;
			if (!lastInput) {
				break;
			}
			row.value = lastInput.row;
			col.value = lastInput.col;
			searchRow.value = lastInput.searchRow;
			searchCol.value = lastInput.searchCol;
			target.value = lastInput.target;
			partialMatch.value = lastInput.partialMatch;
			break;
	}
});