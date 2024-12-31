# CSV-Manipulate

Get/Set a cell's value in a csv file using row/column names.

# Demo

## GUI
![gui_demo](gui_demo.gif)

## CLI
![demo](demo.gif)

# Usage

1. GUI available now. Click the sidebar icon and enjoy.

2. CLI usage:
`Ctrl+Shift+P` and type `get cell` or `set cell`. You will be prompted to input `row-name, col-name [,target-value]`. By default the row name and col name will be trimmed first.

# Options
There are several tunable options controlling the behavior of the extension, check details in the extension settings page.

# Roadmap
| Feature    | Offered |
| -------- 	 | ------- |
|1. Settings page, to control trim enabled, separator other than ',' etc. 	|	✅|
|2. GUI support(maybe?)													 	|	✅|
|3. Support modify csv file by any row/col, besides 1st row/col.			|	❌|
|4. Keep last executed command												|	✅|
|5. Partial match and case sensitivity										|	✅|
|6. Fuzzy search															|	🏃|
|7. Move cursor to target after getting/setting								|	✅|
|8. Autocomplete															|	🏃|
|9. GUI adapt to color theme												|	❌|