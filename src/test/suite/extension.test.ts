import * as assert from 'assert';
import * as vscode from 'vscode';
import { getCellValue, getRowNumbers, getColNumbers, findCellValueAndSelection, setCellValue } from '../../extension';
import { beforeEach } from 'mocha';

let csvContent = `resource,col-header1,col-header2,col-header3
row-header1,value1,value2,value3
row-header2,value4,value5,value6`;

let newCsvContent = `resource,col-header1,col-header2,col-header3
row-header1,value1,value2,value3
row-header2,value4,value5,value6
row-header3,value7,value8,value9
row-header4,value10,value11,value12`;

let csvContentSecondRow = `garbage,garbage,garbage,garbage
resource,col-header1,col-header2,col-header3
row-header1,value1,value2,value3
row-header2,value4,value5,value6`;

let csvContentSecondCol = `garbage,resource,col-header1,col-header2,col-header3
garbage,row-header1,value1,value2,value3
garbage,row-header2,value4,value5,value6`;

const mockDocument: vscode.TextDocument = {
    lineCount: 3,
    lineAt: (position: number | vscode.Position): vscode.TextLine => {
        const lineNumber = typeof position === 'number' ? position : position.line;
        const lines = csvContent.split('\n');
        const line = lines[lineNumber];
        return {
            lineNumber: lineNumber,
            text: line,
            range: new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(lineNumber, line.length)),
            firstNonWhitespaceCharacterIndex: 0,
            isEmptyOrWhitespace: false,
            rangeIncludingLineBreak: new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(lineNumber, line.length))
        };
    },
    getText: () => csvContent,
    getWordRangeAtPosition: () => undefined,
    uri: vscode.Uri.file('test.csv'),
    fileName: 'test.csv',
    isUntitled: false,
    languageId: 'csv',
    version: 1,
    isDirty: false,
    isClosed: false,
    save: () => Promise.resolve(true),
    eol: vscode.EndOfLine.LF,
    positionAt: () => new vscode.Position(0, 0),
    offsetAt: () => 0,
    validateRange: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
    validatePosition: () => new vscode.Position(0, 0)
};

const mockDocumentSecondRow: vscode.TextDocument = {
    lineCount: 4,
    lineAt: (position: number | vscode.Position): vscode.TextLine => {
        const lineNumber = typeof position === 'number' ? position : position.line;
        const lines = csvContentSecondRow.split('\n');
        const line = lines[lineNumber];
        return {
            lineNumber: lineNumber,
            text: line,
            range: new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(lineNumber, line.length)),
            firstNonWhitespaceCharacterIndex: 0,
            isEmptyOrWhitespace: false,
            rangeIncludingLineBreak: new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(lineNumber, line.length))
        };
    },
    getText: () => csvContentSecondRow,
    getWordRangeAtPosition: () => undefined,
    uri: vscode.Uri.file('test.csv'),
    fileName: 'test.csv',
    isUntitled: false,
    languageId: 'csv',
    version: 1,
    isDirty: false,
    isClosed: false,
    save: () => Promise.resolve(true),
    eol: vscode.EndOfLine.LF,
    positionAt: () => new vscode.Position(0, 0),
    offsetAt: () => 0,
    validateRange: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
    validatePosition: () => new vscode.Position(0, 0)
};

const mockDocumentSecondCol: vscode.TextDocument = {
    lineCount: 3,
    lineAt: (position: number | vscode.Position): vscode.TextLine => {
        const lineNumber = typeof position === 'number' ? position : position.line;
        const lines = csvContentSecondCol.split('\n');
        const line = lines[lineNumber];
        return {
            lineNumber: lineNumber,
            text: line,
            range: new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(lineNumber, line.length)),
            firstNonWhitespaceCharacterIndex: 0,
            isEmptyOrWhitespace: false,
            rangeIncludingLineBreak: new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(lineNumber, line.length))
        };
    },
    getText: () => csvContentSecondCol,
    getWordRangeAtPosition: () => undefined,
    uri: vscode.Uri.file('test.csv'),
    fileName: 'test.csv',
    isUntitled: false,
    languageId: 'csv',
    version: 1,
    isDirty: false,
    isClosed: false,
    save: () => Promise.resolve(true),
    eol: vscode.EndOfLine.LF,
    positionAt: () => new vscode.Position(0, 0),
    offsetAt: () => 0,
    validateRange: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
    validatePosition: () => new vscode.Position(0, 0)
};

suite('Extension Test Suite', () => {

    const originalCsvContent = `resource,col-header1,col-header2,col-header3
row-header1,value1,value2,value3
row-header2,value4,value5,value6`;

    const originalCsvContentSecondRow = `garbage,garbage,garbage,garbage
resource,col-header1,col-header2,col-header3
row-header1,value1,value2,value3
row-header2,value4,value5,value6`;

    const originalCsvContentSecondCol = `garbage,resource,col-header1,col-header2,col-header3
garbage,row-header1,value1,value2,value3
garbage,row-header2,value4,value5,value6`;

    beforeEach(() => {
        csvContent = originalCsvContent;
        csvContentSecondRow = originalCsvContentSecondRow;
        csvContentSecondCol = originalCsvContentSecondCol;
    });
    vscode.window.showInformationMessage('Start all tests.');

    test('getColNumbers', () => {
        assert.deepStrictEqual(getColNumbers(mockDocument, 'col-header2', 1, false), [2]);
        assert.deepStrictEqual(getColNumbers(mockDocument, 'col-header', 1, true), [1, 2, 3]);
        assert.deepStrictEqual(getColNumbers(mockDocumentSecondRow, 'col-header2', 2, false), [2]);
        assert.deepStrictEqual(getColNumbers(mockDocumentSecondCol, 'col-header2', 1, false), [3]);
    });

    test('getRowNumbers', () => {
        assert.deepStrictEqual(getRowNumbers(mockDocument, 'row-header1', 1, false), [1]);
        assert.deepStrictEqual(getRowNumbers(mockDocument, 'row-header', 1, true), [1, 2]);
        assert.deepStrictEqual(getRowNumbers(mockDocumentSecondRow, 'row-header1', 1, false), [2]);
        assert.deepStrictEqual(getRowNumbers(mockDocumentSecondCol, 'row-header1', 2, false), [1]);
    });

    test('getCellValue', () => {
        const mockEditor: vscode.TextEditor = {
            document: mockDocument,
            selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            selections: [],
            visibleRanges: [],
            options: {},
            viewColumn: undefined,
            edit: () => Promise.resolve(true),
            insertSnippet: () => Promise.resolve(true),
            setDecorations: () => { },
            revealRange: () => { },
            show: () => { },
            hide: () => { }
        };

        assert.strictEqual(getCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 1, searchCol: 1, target: '', partialMatch: false }), 'value2');
        assert.strictEqual(getCellValue(mockEditor, { row: 'header2', col: 'header3', searchRow: 1, searchCol: 1, target: '', partialMatch: true }), 'value6');
    });

    test('findCellValueAndSelection', () => {
        const { cellVal, cellSelection } = findCellValueAndSelection(mockDocument, 1, 2);
        assert.strictEqual(cellVal, 'value2');
        assert.deepStrictEqual(cellSelection, new vscode.Selection(new vscode.Position(1, 19), new vscode.Position(1, 25)));
    });

    test('getCellValue - not found', () => {
        const mockEditor: vscode.TextEditor = {
            document: mockDocument,
            selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            selections: [],
            visibleRanges: [],
            options: {},
            viewColumn: undefined,
            edit: () => Promise.resolve(true),
            insertSnippet: () => Promise.resolve(true),
            setDecorations: () => { },
            revealRange: () => { },
            show: () => { },
            hide: () => { }
        };

        assert.strictEqual(getCellValue(mockEditor, { row: 'non-existent-row', col: 'col-header2', searchRow: 1, searchCol: 1, target: '', partialMatch: false }), '');
    });

    test('getCellValue - second row', () => {
        const mockEditor: vscode.TextEditor = {
            document: mockDocumentSecondRow,
            selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            selections: [],
            visibleRanges: [],
            options: {},
            viewColumn: undefined,
            edit: () => Promise.resolve(true),
            insertSnippet: () => Promise.resolve(true),
            setDecorations: () => { },
            revealRange: () => { },
            show: () => { },
            hide: () => { }
        };

        assert.strictEqual(getCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 2, searchCol: 1, target: '', partialMatch: false }), 'value2');
    });

    test('getCellValue - second col', () => {
        const mockEditor: vscode.TextEditor = {
            document: mockDocumentSecondCol,
            selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            selections: [],
            visibleRanges: [],
            options: {},
            viewColumn: undefined,
            edit: () => Promise.resolve(true),
            insertSnippet: () => Promise.resolve(true),
            setDecorations: () => { },
            revealRange: () => { },
            show: () => { },
            hide: () => { }
        };

        assert.strictEqual(getCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 1, searchCol: 2, target: '', partialMatch: false }), 'value2');
    });

    test('setCellValue', async () => {
        const mockEditor: vscode.TextEditor = {
            document: mockDocument, selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)), selections: [], visibleRanges: [], options: {}, viewColumn: undefined, edit: (callback: (editBuilder: vscode.TextEditorEdit) => void): Promise<boolean> => {
                const editBuilder: vscode.TextEditorEdit = {
                    replace: (location: vscode.Selection, value: string) => {
                        const lines = csvContent.split('\n'); const line = lines[location.start.line]; const before = line.substring(0, location.start.character);
                        const after = line.substring(location.end.character);
                        lines[location.start.line] = before + value + after;
                        csvContent = lines.join('\n');
                    },
                    insert: () => { },
                    delete: () => { },
                    setEndOfLine: () => { }
                };
                callback(editBuilder);
                return Promise.resolve(true);
            },
            insertSnippet: () => Promise.resolve(true),
            setDecorations: () => { },
            revealRange: () => { },
            show: () => { },
            hide: () => { }
        };
        // Mock vscode.window.showTextDocument to return our mock editor
        const originalShowTextDocument = vscode.window.showTextDocument;
        vscode.window.showTextDocument = async (document: any, options?: any): Promise<vscode.TextEditor> => {
            return mockEditor;
        };
        await setCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 1, searchCol: 1, target: 'new-value', partialMatch: false });
        assert.strictEqual(getCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 1, searchCol: 1, target: '', partialMatch: false }), 'new-value');
        vscode.window.showTextDocument = originalShowTextDocument; // Restore original function
    });

    test('setCellValue - partial match', async () => {
        const mockEditor: vscode.TextEditor = {
            document: mockDocument,
            selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            selections: [],
            visibleRanges: [],
            options: {},
            viewColumn: undefined,
            edit: (callback: (editBuilder: vscode.TextEditorEdit) => void): Promise<boolean> => {
                const editBuilder: vscode.TextEditorEdit = {
                    replace: (location: vscode.Selection, value: string) => {
                        const lines = csvContent.split('\n');
                        const line = lines[location.start.line];
                        const before = line.substring(0, location.start.character);
                        const after = line.substring(location.end.character);
                        lines[location.start.line] = before + value + after;
                        csvContent = lines.join('\n');
                    },
                    insert: () => { },
                    delete: () => { },
                    setEndOfLine: () => { }
                };
                callback(editBuilder);
                return Promise.resolve(true);
            },
            insertSnippet: () => Promise.resolve(true),
            setDecorations: () => { },
            revealRange: () => { },
            show: () => { },
            hide: () => { }
        };

        // Mock vscode.window.showTextDocument to return our mock editor
        const originalShowTextDocument = vscode.window.showTextDocument;
        vscode.window.showTextDocument = async (document: any, options?: any): Promise<vscode.TextEditor> => {
            return mockEditor;
        };

        await setCellValue(mockEditor, { row: 'header1', col: 'header2', searchRow: 1, searchCol: 1, target: 'new-value', partialMatch: true });
        assert.strictEqual(getCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 1, searchCol: 1, target: '', partialMatch: false }), 'new-value');
        vscode.window.showTextDocument = originalShowTextDocument; // Restore original function
    });

    test('setCellValue - second row', async () => {
        const mockEditor: vscode.TextEditor = {
            document: mockDocumentSecondRow,
            selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            selections: [],
            visibleRanges: [],
            options: {},
            viewColumn: undefined,
            edit: (callback: (editBuilder: vscode.TextEditorEdit) => void): Promise<boolean> => {
                const editBuilder: vscode.TextEditorEdit = {
                    replace: (location: vscode.Selection, value: string) => {
                        const lines = csvContentSecondRow.split('\n');
                        const line = lines[location.start.line];
                        const before = line.substring(0, location.start.character);
                        const after = line.substring(location.end.character);
                        lines[location.start.line] = before + value + after;
                        csvContentSecondRow = lines.join('\n');
                    },
                    insert: () => { },
                    delete: () => { },
                    setEndOfLine: () => { }
                };
                callback(editBuilder);
                return Promise.resolve(true);
            },
            insertSnippet: () => Promise.resolve(true),
            setDecorations: () => { },
            revealRange: () => { },
            show: () => { },
            hide: () => { }
        };

        // Mock vscode.window.showTextDocument to return our mock editor
        const originalShowTextDocument = vscode.window.showTextDocument;
        vscode.window.showTextDocument = async (document: any, options?: any): Promise<vscode.TextEditor> => {
            return mockEditor;
        };

        await setCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 2, searchCol: 1, target: 'new-value', partialMatch: false });
        assert.strictEqual(getCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 2, searchCol: 1, target: '', partialMatch: false }), 'new-value');
        vscode.window.showTextDocument = originalShowTextDocument; // Restore original function
    });

    test('setCellValue - second col', async () => {
        const mockEditor: vscode.TextEditor = {
            document: mockDocumentSecondCol,
            selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            selections: [],
            visibleRanges: [],
            options: {},
            viewColumn: undefined,
            edit: (callback: (editBuilder: vscode.TextEditorEdit) => void): Promise<boolean> => {
                const editBuilder: vscode.TextEditorEdit = {
                    replace: (location: vscode.Selection, value: string) => {
                        const lines = csvContentSecondCol.split('\n');
                        const line = lines[location.start.line];
                        const before = line.substring(0, location.start.character);
                        const after = line.substring(location.end.character);
                        lines[location.start.line] = before + value + after;
                        csvContentSecondCol = lines.join('\n');
                    },
                    insert: () => { },
                    delete: () => { },
                    setEndOfLine: () => { }
                };
                callback(editBuilder);
                return Promise.resolve(true);
            },
            insertSnippet: () => Promise.resolve(true),
            setDecorations: () => { },
            revealRange: () => { },
            show: () => { },
            hide: () => { }
        };

        // Mock vscode.window.showTextDocument to return our mock editor
        const originalShowTextDocument = vscode.window.showTextDocument;
        vscode.window.showTextDocument = async (document: any, options?: any): Promise<vscode.TextEditor> => {
            return mockEditor;
        };

        await setCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 1, searchCol: 2, target: 'new-value', partialMatch: false });
        assert.strictEqual(getCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 1, searchCol: 2, target: '', partialMatch: false }), 'new-value');
        vscode.window.showTextDocument = originalShowTextDocument; // Restore original function
    });

    test('setCellValue - row not found', async () => {
        const mockEditor: vscode.TextEditor = {
            document: mockDocument,
            selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            selections: [],
            visibleRanges: [],
            options: {},
            viewColumn: undefined,
            edit: () => Promise.resolve(true),
            insertSnippet: () => Promise.resolve(true),
            setDecorations: () => { },
            revealRange: () => { },
            show: () => { },
            hide: () => { }
        };

        await setCellValue(mockEditor, { row: 'non-existent-row', col: 'col-header2', searchRow: 1, searchCol: 1, target: 'new-value', partialMatch: false });
        assert.strictEqual(getCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 1, searchCol: 1, target: '', partialMatch: false }), 'value2');
    });

    test('setCellValue - col not found', async () => {
        const mockEditor: vscode.TextEditor = {
            document: mockDocument,
            selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            selections: [],
            visibleRanges: [],
            options: {},
            viewColumn: undefined,
            edit: () => Promise.resolve(true),
            insertSnippet: () => Promise.resolve(true),
            setDecorations: () => { },
            revealRange: () => { },
            show: () => { },
            hide: () => { }
        };

        // Mock vscode.window.showTextDocument to return our mock editor
        const originalShowTextDocument = vscode.window.showTextDocument;
        vscode.window.showTextDocument = async (document: any, options?: any): Promise<vscode.TextEditor> => {
            return mockEditor;
        };

        await setCellValue(mockEditor, { row: 'row-header1', col: 'non-existent-col', searchRow: 1, searchCol: 1, target: 'new-value', partialMatch: false });
        vscode.window.showTextDocument = originalShowTextDocument; // Restore original function
        assert.strictEqual(getCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 1, searchCol: 1, target: '', partialMatch: false }), 'value2');
    });

    suite('setCellValue without getCellValue dependency', () => {
        test('setCellValue', async () => {
            const mockEditor: vscode.TextEditor = {
                document: mockDocument, selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)), selections: [], visibleRanges: [], options: {}, viewColumn: undefined, edit: (callback: (editBuilder: vscode.TextEditorEdit) => void): Promise<boolean> => {
                    const editBuilder: vscode.TextEditorEdit = {
                        replace: (location: vscode.Selection, value: string) => {
                            const lines = csvContent.split('\n'); const line = lines[location.start.line]; const before = line.substring(0, location.start.character);
                            const after = line.substring(location.end.character);
                            lines[location.start.line] = before + value + after;
                            csvContent = lines.join('\n');
                        },
                        insert: () => { },
                        delete: () => { },
                        setEndOfLine: () => { }
                    };
                    callback(editBuilder);
                    return Promise.resolve(true);
                },
                insertSnippet: () => Promise.resolve(true),
                setDecorations: () => { },
                revealRange: () => { },
                show: () => { },
                hide: () => { }
            };
            // Mock vscode.window.showTextDocument to return our mock editor
            const originalShowTextDocument = vscode.window.showTextDocument;
            vscode.window.showTextDocument = async (document: any, options?: any): Promise<vscode.TextEditor> => {
                return mockEditor;
            };
            await setCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 1, searchCol: 1, target: 'new-value', partialMatch: false });
            const expectedCsvContent = `resource,col-header1,col-header2,col-header3\nrow-header1,value1,new-value,value3\nrow-header2,value4,value5,value6`;
            assert.strictEqual(csvContent, expectedCsvContent);
            vscode.window.showTextDocument = originalShowTextDocument; // Restore original function
        });

        test('setCellValue - partial match', async () => {
            const mockEditor: vscode.TextEditor = {
                document: mockDocument,
                selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
                selections: [],
                visibleRanges: [],
                options: {},
                viewColumn: undefined,
                edit: (callback: (editBuilder: vscode.TextEditorEdit) => void): Promise<boolean> => {
                    const editBuilder: vscode.TextEditorEdit = {
                        replace: (location: vscode.Selection, value: string) => {
                            const lines = csvContent.split('\n');
                            const line = lines[location.start.line];
                            const before = line.substring(0, location.start.character);
                            const after = line.substring(location.end.character);
                            lines[location.start.line] = before + value + after;
                            csvContent = lines.join('\n');
                        },
                        insert: () => { },
                        delete: () => { },
                        setEndOfLine: () => { }
                    };
                    callback(editBuilder);
                    return Promise.resolve(true);
                },
                insertSnippet: () => Promise.resolve(true),
                setDecorations: () => { },
                revealRange: () => { },
                show: () => { },
                hide: () => { }
            };

            // Mock vscode.window.showTextDocument to return our mock editor
            const originalShowTextDocument = vscode.window.showTextDocument;
            vscode.window.showTextDocument = async (document: any, options?: any): Promise<vscode.TextEditor> => {
                return mockEditor;
            };

            await setCellValue(mockEditor, { row: 'header1', col: 'header2', searchRow: 1, searchCol: 1, target: 'new-value', partialMatch: true });
            const expectedCsvContent = `resource,col-header1,col-header2,col-header3\nrow-header1,value1,new-value,value3\nrow-header2,value4,value5,value6`;
            assert.strictEqual(csvContent, expectedCsvContent);
            vscode.window.showTextDocument = originalShowTextDocument; // Restore original function
        });

        test('setCellValue - second row', async () => {
            const mockEditor: vscode.TextEditor = {
                document: mockDocumentSecondRow,
                selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
                selections: [],
                visibleRanges: [],
                options: {},
                viewColumn: undefined,
                edit: (callback: (editBuilder: vscode.TextEditorEdit) => void): Promise<boolean> => {
                    const editBuilder: vscode.TextEditorEdit = {
                        replace: (location: vscode.Selection, value: string) => {
                            const lines = csvContentSecondRow.split('\n');
                            const line = lines[location.start.line];
                            const before = line.substring(0, location.start.character);
                            const after = line.substring(location.end.character);
                            lines[location.start.line] = before + value + after;
                            csvContentSecondRow = lines.join('\n');
                        },
                        insert: () => { },
                        delete: () => { },
                        setEndOfLine: () => { }
                    };
                    callback(editBuilder);
                    return Promise.resolve(true);
                },
                insertSnippet: () => Promise.resolve(true),
                setDecorations: () => { },
                revealRange: () => { },
                show: () => { },
                hide: () => { }
            };

            // Mock vscode.window.showTextDocument to return our mock editor
            const originalShowTextDocument = vscode.window.showTextDocument;
            vscode.window.showTextDocument = async (document: any, options?: any): Promise<vscode.TextEditor> => {
                return mockEditor;
            };

            await setCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 2, searchCol: 1, target: 'new-value', partialMatch: false });
            const expectedCsvContent = `garbage,garbage,garbage,garbage\nresource,col-header1,col-header2,col-header3\nrow-header1,value1,new-value,value3\nrow-header2,value4,value5,value6`;
            assert.strictEqual(csvContentSecondRow, expectedCsvContent);
            vscode.window.showTextDocument = originalShowTextDocument; // Restore original function
        });

        test('setCellValue - second col', async () => {
            const mockEditor: vscode.TextEditor = {
                document: mockDocumentSecondCol,
                selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
                selections: [],
                visibleRanges: [],
                options: {},
                viewColumn: undefined,
                edit: (callback: (editBuilder: vscode.TextEditorEdit) => void): Promise<boolean> => {
                    const editBuilder: vscode.TextEditorEdit = {
                        replace: (location: vscode.Selection, value: string) => {
                            const lines = csvContentSecondCol.split('\n');
                            const line = lines[location.start.line];
                            const before = line.substring(0, location.start.character);
                            const after = line.substring(location.end.character);
                            lines[location.start.line] = before + value + after;
                            csvContentSecondCol = lines.join('\n');
                        },
                        insert: () => { },
                        delete: () => { },
                        setEndOfLine: () => { }
                    };
                    callback(editBuilder);
                    return Promise.resolve(true);
                },
                insertSnippet: () => Promise.resolve(true),
                setDecorations: () => { },
                revealRange: () => { },
                show: () => { },
                hide: () => { }
            };

            // Mock vscode.window.showTextDocument to return our mock editor
            const originalShowTextDocument = vscode.window.showTextDocument;
            vscode.window.showTextDocument = async (document: any, options?: any): Promise<vscode.TextEditor> => {
                return mockEditor;
            };

            await setCellValue(mockEditor, { row: 'row-header1', col: 'col-header2', searchRow: 1, searchCol: 2, target: 'new-value', partialMatch: false });
            const expectedCsvContent = `garbage,resource,col-header1,col-header2,col-header3\ngarbage,row-header1,value1,new-value,value3\ngarbage,row-header2,value4,value5,value6`;
            assert.strictEqual(csvContentSecondCol, expectedCsvContent);
            vscode.window.showTextDocument = originalShowTextDocument; // Restore original function
        });

        test('setCellValue - row not found', async () => {
            const mockEditor: vscode.TextEditor = {
                document: mockDocument,
                selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
                selections: [],
                visibleRanges: [],
                options: {},
                viewColumn: undefined,
                edit: () => Promise.resolve(true),
                insertSnippet: () => Promise.resolve(true),
                setDecorations: () => { },
                revealRange: () => { },
                show: () => { },
                hide: () => { }
            };

            await setCellValue(mockEditor, { row: 'non-existent-row', col: 'col-header2', searchRow: 1, searchCol: 1, target: 'new-value', partialMatch: false });
            assert.strictEqual(csvContent, originalCsvContent);
        });

        test('setCellValue - col not found', async () => {
            const mockEditor: vscode.TextEditor = {
                document: mockDocument,
                selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
                selections: [],
                visibleRanges: [],
                options: {},
                viewColumn: undefined,
                edit: () => Promise.resolve(true),
                insertSnippet: () => Promise.resolve(true),
                setDecorations: () => { },
                revealRange: () => { },
                show: () => { },
                hide: () => { }
            };

            // Mock vscode.window.showTextDocument to return our mock editor
            const originalShowTextDocument = vscode.window.showTextDocument;
            vscode.window.showTextDocument = async (document: any, options?: any): Promise<vscode.TextEditor> => {
                return mockEditor;
            };

            await setCellValue(mockEditor, { row: 'row-header1', col: 'non-existent-col', searchRow: 1, searchCol: 1, target: 'new-value', partialMatch: false });
            vscode.window.showTextDocument = originalShowTextDocument; // Restore original function
            assert.strictEqual(csvContent, originalCsvContent);
        });
    });

    suite('Tests with new CSV data', () => {
        const newCsvContent = `resource,col-header1,col-header2,col-header3
row-header1,value1,value2,value3
row-header2,value4,value5,value6
row-header3,value7,value8,value9
row-header4,value10,value11,value12`;

        let csvContentForTest: string;

        const mockDocumentNew: vscode.TextDocument = {
            lineCount: 5,
            lineAt: (position: number | vscode.Position): vscode.TextLine => {
                const lineNumber = typeof position === 'number' ? position : position.line;
                const lines = csvContentForTest.split('\n');
                const line = lines[lineNumber];
                return {
                    lineNumber: lineNumber,
                    text: line,
                    range: new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(lineNumber, line.length)),
                    firstNonWhitespaceCharacterIndex: 0,
                    isEmptyOrWhitespace: false,
                    rangeIncludingLineBreak: new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(lineNumber, line.length))
                };
            },
            getText: () => csvContentForTest,
            getWordRangeAtPosition: () => undefined,
            uri: vscode.Uri.file('test.csv'),
            fileName: 'test.csv',
            isUntitled: false,
            languageId: 'csv',
            version: 1,
            isDirty: false,
            isClosed: false,
            save: () => Promise.resolve(true),
            eol: vscode.EndOfLine.LF,
            positionAt: () => new vscode.Position(0, 0),
            offsetAt: () => 0,
            validateRange: () => new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            validatePosition: () => new vscode.Position(0, 0)
        };

        beforeEach(() => {
            csvContentForTest = newCsvContent;
        });

        test('getCellValue - new data', () => {
            const mockEditor: vscode.TextEditor = {
                document: mockDocumentNew,
                selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
                selections: [],
                visibleRanges: [],
                options: {},
                viewColumn: undefined,
                edit: () => Promise.resolve(true),
                insertSnippet: () => Promise.resolve(true),
                setDecorations: () => {},
                revealRange: () => {},
                show: () => {},
                hide: () => {}
            };

            assert.strictEqual(getCellValue(mockEditor, { row: 'row-header3', col: 'col-header2', searchRow: 1, searchCol: 1, target: '', partialMatch: false }), 'value8');
            assert.strictEqual(getCellValue(mockEditor, { row: 'row-header4', col: 'col-header3', searchRow: 1, searchCol: 1, target: '', partialMatch: false }), 'value12');
        });

        test('setCellValue - new data', async () => {
            const mockEditor: vscode.TextEditor = {
                document: mockDocumentNew,
                selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
                selections: [],
                visibleRanges: [],
                options: {},
                viewColumn: undefined,
                edit: (callback: (editBuilder: vscode.TextEditorEdit) => void): Promise<boolean> => {
                    const editBuilder: vscode.TextEditorEdit = {
                        replace: (location: vscode.Selection, value: string) => {
                            const lines = csvContentForTest.split('\n');
                            const line = lines[location.start.line];
                            const before = line.substring(0, location.start.character);
                            const after = line.substring(location.end.character);
                            lines[location.start.line] = before + value + after;
                            csvContentForTest = lines.join('\n');
                        },
                        insert: () => {},
                        delete: () => {},
                        setEndOfLine: () => {}
                    };
                    callback(editBuilder);
                    return Promise.resolve(true);
                },
                insertSnippet: () => Promise.resolve(true),
                setDecorations: () => {},
                revealRange: () => {},
                show: () => {},
                hide: () => {}
            };
            // Mock vscode.window.showTextDocument to return our mock editor
            const originalShowTextDocument = vscode.window.showTextDocument;
            vscode.window.showTextDocument = async (document: any, options?: any): Promise<vscode.TextEditor> => {
                return mockEditor;
            };
            await setCellValue(mockEditor, { row: 'row-header3', col: 'col-header2', searchRow: 1, searchCol: 1, target: 'new-value-8', partialMatch: false });
            const expectedCsvContent = `resource,col-header1,col-header2,col-header3
row-header1,value1,value2,value3
row-header2,value4,value5,value6
row-header3,value7,new-value-8,value9
row-header4,value10,value11,value12`;
            assert.strictEqual(csvContentForTest, expectedCsvContent);

            await setCellValue(mockEditor, { row: 'row-header4', col: 'col-header3', searchRow: 1, searchCol: 1, target: 'new-value-12', partialMatch: false });
            const expectedCsvContent2 = `resource,col-header1,col-header2,col-header3
row-header1,value1,value2,value3
row-header2,value4,value5,value6
row-header3,value7,new-value-8,value9
row-header4,value10,value11,new-value-12`;
            assert.strictEqual(csvContentForTest, expectedCsvContent2);

            vscode.window.showTextDocument = originalShowTextDocument; // Restore original function
        });
    });
});