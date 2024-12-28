# CSV-Manipulate

Get/Set a cell's value in a csv file using row/column names. For now, only separator ',' is supported.

# Demo

![demo](demo.gif)

# Usage
`ctrl+shift+p` and type `get cell` or `set cell`. You will be prompted to input `row-name, col-name [,target-value]`. Note that the row name, col name, target value will be trimmed first.

# Options
There are several tunable options controlling the behavior of the extension, check details in the extension settings page.

# Roadmap
| Feature    | Offered |
| -------- 	 | ------- |
|1. Settings page, to control trim enabled, separator other than ',' etc. 	|	✅|
|2. GUI support(maybe?)													 	|	❌|
|3. Support modify csv file by any row/col, besides 1st row/col.			|	❌|
|4. Keep last executed command												|	✅|
|5. Partial match and case sensitivity										|	✅|
|6. Fuzzy search															|	❌|
|7. Move cursor to target after getting/setting								|	✅|