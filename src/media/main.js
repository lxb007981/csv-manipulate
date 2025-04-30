const vscode = acquireVsCodeApi();

function getUserResponse(requireTarget) {
	const row = document.getElementById('csv-manipulate-row').value;
	const col = document.getElementById('csv-manipulate-col').value;
	const searchRow = document.getElementById('csv-manipulate-search-row').value || 1;
	const searchCol = document.getElementById('csv-manipulate-search-col').value || 1;
	const partialMatch = document.getElementById('csv-manipulate-partial-match').checked;
	const findAll = document.getElementById('csv-manipulate-find-all').checked;
	let res = {
		row: row,
		col: col,
		searchRow: Number(searchRow),
		searchCol: Number(searchCol),
		target: "",
		partialMatch,
		findAll,
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

function panelPlotAllMatchesTable(entries) {
	if (!entries) {
		return;
	}

	const tableContainer = document.getElementById("csv-manipulate-multiple-matches-container");
	if (!tableContainer) {
		return;
	}
	if (!Array.isArray(entries) || entries.length === 0) {
		return;
	}

	const uniqueRowNames = new Set();
	const uniqueColNames = new Set();
	const dataLookup = {}; // Structure: { rowName: { colName: cellValue } }

	// find unique rows/cols and build lookup structure
	entries.forEach(({rowName, colName, cellVal}) => {
		if (rowName === undefined || colName === undefined || cellVal === undefined) {
			return;
		}
		uniqueRowNames.add(rowName);
		uniqueColNames.add(colName);

		if (!dataLookup[rowName]) {
			dataLookup[rowName] = {};
		}
		dataLookup[rowName][colName] = cellVal;
	});

	// Convert Sets to sorted arrays for consistent order
	const sortedRowNames = Array.from(uniqueRowNames).sort();
	const sortedColNames = Array.from(uniqueColNames).sort();

	// 2. Generate HTML Table String
	let html = '<table>';

	// --- Header Row (thead) ---
	html += '<thead><tr>';
	html += '<th></th>'; // Empty top-left corner cell
	sortedColNames.forEach(colName => {
		html += `<th>${colName}</th>`;
	});
	html += '</tr></thead>';

	html += '<tbody>';
	sortedRowNames.forEach(rowName => {
		html += '<tr>';
		// Row Header Cell
		html += `<th>${rowName}</th>`;

		sortedColNames.forEach(colName => {
			const cellValue = dataLookup[rowName] ? dataLookup[rowName][colName] : undefined;
			const displayValue = (cellValue !== undefined && cellValue !== null) ? cellValue : '-'; // Use '-' for empty/null cells
			const cellClass = (cellValue === undefined || cellValue === null) ? ' class="empty-cell"' : ''; // Add class for styling empty cells
			html += `<td${cellClass}>${displayValue}</td>`;
		});
		html += '</tr>';
	});
	html += '</tbody>';
	html += '</table>';
	tableContainer.innerHTML = html;
}
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
		case 'csv-manipulate-plot-all-matches':
			panelPlotAllMatchesTable(message.entries);
			break;
	}
});