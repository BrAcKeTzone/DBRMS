import React from "react";

// Generic Table component
// Props:
// - columns: Array of column definitions. Each column can have:
//    - header: string (column title)
//    - accessor: string (path to value on row object)
//    - key: string (alias for accessor)
//    - cell: function(row) -> React.Node to render custom cell
//    - render: alternative name for cell
//    - sortable: boolean
// - data: Array of row objects
// - loading: boolean
// - emptyMessage: string
// - sortBy, sortOrder, onSort: optional sorting controls

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No data",
  sortBy,
  sortOrder = "asc",
  onSort,
}) => {
  const handleSort = (col) => {
    if (!col.sortable || !onSort) return;
    const colKey = col.accessor || col.key || col.header;
    onSort(colKey);
  };

  const renderCell = (col, row) => {
    const cellFn = col.cell || col.render;
    if (typeof cellFn === "function") return cellFn(row);

    const accessor = col.accessor || col.key;
    if (!accessor) return "";

    // Support nested accessors like 'parent.firstName'
    const value = accessor.split(".").reduce((acc, k) => acc?.[k], row);
    return value === undefined || value === null ? "" : String(value);
  };

  return (
    <div className="overflow-auto">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
            {columns.map((col, idx) => {
              const colKey = col.accessor || col.key || col.header || idx;
              return (
                <th
                  key={colKey}
                  className={`px-3 py-2 ${
                    col.sortable ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {col.header || col.header === 0 ? col.header : colKey}
                    </span>
                    {col.sortable && sortBy === colKey && (
                      <span className="text-xs">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-gray-500"
              >
                Loading...
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((row, rIdx) => (
              <tr key={row.id ?? rIdx} className="border-t">
                {columns.map((col, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-3 py-3 text-sm text-gray-900 align-top"
                  >
                    {renderCell(col, row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="px-3 py-6 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
