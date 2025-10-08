"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Minimal, spreadsheet-like editable grid
// Props:
// - columns: [{ key, header, width?, type?: 'text'|'number'|'select', options?: string[] }]
// - rows: Array<Record<string, any>>
// - onChange: (nextRows) => void
// - getRowKey?: (row, index) => string
// - className?: string
export default function EditableGrid({
  columns,
  rows,
  onChange,
  getRowKey,
  className = "",
}) {
  const [editingCell, setEditingCell] = useState(null); // {rowIndex, colIndex}
  const inputsRef = useRef({});

  const rowKey = useCallback(
    (row, index) => {
      if (getRowKey) return getRowKey(row, index);
      return String(row?.id ?? index);
    },
    [getRowKey]
  );

  const handleCellCommit = useCallback(
    (r, c, value) => {
      const col = columns[c];
      const next = rows.map((row, idx) =>
        idx === r ? { ...row, [col.key]: coerceValue(value, col.type) } : row
      );
      onChange(next);
    },
    [columns, rows, onChange]
  );

  const focusInput = useCallback((r, c) => {
    const key = `${r}-${c}`;
    requestAnimationFrame(() => {
      const el = inputsRef.current[key];
      if (el) {
        el.focus();
        if (el.select) el.select();
      }
    });
  }, []);

  const handleKeyDown = useCallback(
    (e, r, c) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const nextRow = Math.min(rows.length - 1, r + 1);
        setEditingCell({ rowIndex: nextRow, colIndex: c });
        focusInput(nextRow, c);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextRow = Math.min(rows.length - 1, r + 1);
        setEditingCell({ rowIndex: nextRow, colIndex: c });
        focusInput(nextRow, c);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevRow = Math.max(0, r - 1);
        setEditingCell({ rowIndex: prevRow, colIndex: c });
        focusInput(prevRow, c);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextCol = Math.min(columns.length - 1, c + 1);
        setEditingCell({ rowIndex: r, colIndex: nextCol });
        focusInput(r, nextCol);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevCol = Math.max(0, c - 1);
        setEditingCell({ rowIndex: r, colIndex: prevCol });
        focusInput(r, prevCol);
      }
    },
    [columns.length, rows.length, focusInput]
  );

  return (
    <div className={`overflow-auto rounded-md border ${className}`}>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900/40 sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left font-medium text-gray-600 dark:text-gray-300 px-2 py-2 border-b"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr
              key={rowKey(row, r)}
              className="odd:bg-white even:bg-gray-50/60 dark:odd:bg-gray-900 dark:even:bg-gray-800/60"
            >
              {columns.map((col, c) => (
                <td key={col.key} className="px-2 py-1 border-b align-middle">
                  <CellEditor
                    refKey={`${r}-${c}`}
                    inputsRef={inputsRef}
                    type={col.type}
                    value={row[col.key]}
                    options={col.options}
                    onChange={(val) => handleCellCommit(r, c, val)}
                    onKeyDown={(e) => handleKeyDown(e, r, c)}
                    onFocus={() => setEditingCell({ rowIndex: r, colIndex: c })}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function coerceValue(value, type) {
  if (type === "number") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return value;
}

function CellEditor({
  refKey,
  inputsRef,
  type = "text",
  value,
  options,
  onChange,
  onKeyDown,
  onFocus,
}) {
  const refSetter = useCallback(
    (el) => {
      if (el) inputsRef.current[refKey] = el;
    },
    [refKey, inputsRef]
  );

  if (type === "select") {
    return (
      <select
        ref={refSetter}
        className="w-full rounded border px-2 py-1 bg-white dark:bg-gray-900"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
      >
        {(options ?? []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      ref={refSetter}
      className="w-full rounded border px-2 py-1 bg-white dark:bg-gray-900"
      type={type === "number" ? "number" : "text"}
      value={value ?? (type === "number" ? 0 : "")}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
    />
  );
}

