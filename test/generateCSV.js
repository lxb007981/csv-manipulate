const fs = require('fs');
const { getRandomPrefix } = require('./utils');
// Number of rows and columns (excluding the header row and first column)
const rows = 500;
const cols = 150;

// Function to generate a random 'Y' or 'N'
function getRandomYN() {
    return Math.random() < 0.5 ? 'Y' : 'N';
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
            csvContent += `,${getRandomYN()}`;
        }
        csvContent += '\n';
    }

    return csvContent;
}

// Generate the CSV content
const csvContent = generateCSV(rows, cols);
const outputPath = `${__dirname}/output.csv`;
// Write the CSV content to a file
fs.writeFile(outputPath, csvContent, (err) => {
    if (err) {
        console.error('Error writing CSV file:', err);
    } else {
        console.log(`CSV file generated successfully: ${outputPath}`);
    }
});
