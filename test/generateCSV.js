const fs = require('fs');
const { getRandomPrefix } = require('./utils');
// Number of rows and columns (excluding the header row and first column)
const rows = 500;
const cols = 150;

// Function to generate a random 'Y' or 'N'
function genCell(row, col) {
    return `row${row}_col${col}`
}

// Function to generate the CSV content
function generateCSV(rows, cols) {
    let csvContent = 'resource';

    // Generate the header row
    for (let i = 1; i <= cols; i++) {
        csvContent += `,${getRandomPrefix()}_col_${i}`;
    }
    csvContent += '\n';

    // Generate the data rows
    for (let i = 1; i <= rows; i++) {
        csvContent += `${getRandomPrefix()}_row_${i}`;
        for (let j = 1; j <= cols; j++) {
            csvContent += `,${genCell(i, j)}`;
        }
        csvContent += '\n';
    }

    return csvContent;
}

function generateCSV_row2(rows, cols) {
    let csvContent = 'nonsense';
    for (let i = 1; i <= cols; i++) {
        csvContent += `,nonsense`;
    }

    csvContent += '\nresource';

    // Generate the header row
    for (let i = 1; i <= cols; i++) {
        csvContent += `,${getRandomPrefix()}_col_${i}`;
    }
    csvContent += '\n';

    // Generate the data rows
    for (let i = 1; i <= rows; i++) {
        csvContent += `${getRandomPrefix()}_row_${i}`;
        for (let j = 1; j <= cols; j++) {
            csvContent += `,${genCell(i, j)}`;
        }
        csvContent += '\n';
    }

    return csvContent;
}

// Function to generate the CSV content
function generateCSV_col2(rows, cols) {
    let csvContent = 'nonsense,resource';

    // Generate the header row
    for (let i = 1; i <= cols; i++) {
        csvContent += `,${getRandomPrefix()}_col_${i}`;
    }
    csvContent += '\n';

    // Generate the data rows
    for (let i = 1; i <= rows; i++) {
        csvContent += `nonsense,${getRandomPrefix()}_row_${i}`;
        for (let j = 1; j <= cols; j++) {
            csvContent += `,${genCell(i, j)}`;
        }
        csvContent += '\n';
    }

    return csvContent;
}

// Generate the CSV content
const csvContent = generateCSV(rows, cols);
const csvContent_row2 = generateCSV_row2(rows, cols);
const csvContent_col2 = generateCSV_col2(rows, cols);
const outputPath = `${__dirname}/output.csv`;
const outputPath_row2 = `${__dirname}/output_row2.csv`;
const outputPath_col2 = `${__dirname}/output_col2.csv`;
// Write the CSV content to a file
fs.writeFileSync(outputPath, csvContent);
fs.writeFileSync(outputPath_row2, csvContent_row2);
fs.writeFileSync(outputPath_col2, csvContent_col2);