// src/components/SchemaExplorer.tsx
import React, { useEffect, useState } from 'react'

export default function SchemaExplorer({ connection }) {
  const [tables, setTables] = useState<string[]>([])
  const [columns, setColumns] = useState<any[]>([])

  useEffect(() => {
    // fetch tables on mount
    fetch(`${import.meta.env.VITE_API_BASE_URL}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connection)
    })
      .then(res => res.json())
      .then(data => setTables(data.tables))
  }, [])

  const handleTableClick = async (table: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/columns?table=${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connection)
    })
    const data = await res.json()
    setColumns(data.columns)
  }

  return (
    <div>
      <h2>📂 Schema Explorer</h2>
      <div className="flex">
        <ul className="w-1/2">
          {tables.map((tbl, i) => (
            <li key={i} onClick={() => handleTableClick(tbl)}>{tbl}</li>
          ))}
        </ul>
        <div className="w-1/2">
          {columns.length > 0 && (
            <table>
              <thead>
                <tr><th>Name</th><th>Type</th><th>Nullable</th></tr>
              </thead>
              <tbody>
                {columns.map((col, i) => (
                  <tr key={i}>
                    <td>{col[0]}</td><td>{col[1]}</td><td>{col[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
