import React, { useState } from 'react'

export default function ConnectDataSource() {
  const [showModal, setShowModal] = useState(false)
  const [tables, setTables] = useState<string[]>([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [tableError, setTableError] = useState<string | null>(null)

  const [form, setForm] = useState({
    id: '',
    name: '',
    host: '',
    port: '',
    databaseName: '',
    username: '',
    password: '',
    notes: '',
    additionalInfo: '',
    datasourceType: 'mysql'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleConnect = async () => {
    const formData = {
      datasourceType: form.datasourceType.toLowerCase(),
      displayName: form.name,
      host: form.host,
      port: form.port,
      databaseName: form.databaseName,
      username: form.username,
      password: form.password
    }

    try {
      const res = await fetch('http://localhost:8000/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await res.json()

      if (res.ok) {
        alert('✅ ' + result.message)
        setShowModal(false)

        // 🔄 Fetch tables after connect
        setLoadingTables(true)
        setTableError(null)

        const tablesRes = await fetch('http://localhost:8000/connect/tables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const tablesResult = await tablesRes.json()
        if (tablesRes.ok) {
          setTables(tablesResult || [])
        } else {
          setTableError(tablesResult.detail || 'Failed to fetch tables')
        }
      } else {
        alert('❌ ' + (result.detail || 'Connection failed'))
      }
    } catch (err: any) {
      alert('❌ Error: ' + err.message)
    } finally {
      setLoadingTables(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: '10px 16px',
          backgroundColor: '#6EE7B7',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        ➕ Add Data Source
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Datasource</h3>

            <select name="datasourceType" value={form.datasourceType} onChange={handleChange}>
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="mongodb" disabled>MongoDB (not yet supported)</option>
              <option value="snowflake" disabled>Snowflake (not yet supported)</option>
              <option value="bigquery" disabled>BigQuery (not yet supported)</option>
            </select>

            <input name="id" placeholder="ID" value={form.id} onChange={handleChange} />
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
            <input name="host" placeholder="Host" value={form.host} onChange={handleChange} />
            <input name="port" placeholder="Port" value={form.port} onChange={handleChange} />
            <input name="databaseName" placeholder="Database" value={form.databaseName} onChange={handleChange} />
            <input name="username" placeholder="Username" value={form.username} onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />

            <div style={{ marginTop: '10px' }}>
            <button onClick={handleConnect} disabled={loadingTables}>
  {loadingTables ? '⏳ Connecting...' : '✅ Connect'}
</button>
              <button onClick={() => setShowModal(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Schema Display */}
      <div style={{ marginTop: '20px', padding: '10px' }}>
        <h4>📋 Tables in <strong>{form.databaseName}</strong>:</h4>

        {loadingTables && <p>🔄 Loading tables...</p>}
        {tableError && <p style={{ color: 'red' }}>❌ {tableError}</p>}

        {tables.length > 0 && (
          <ul style={{ paddingLeft: '20px' }}>
            {tables.map((table, idx) => (
              <li key={idx}>📁 {table}</li>
            ))}
          </ul>
        )}

        {tables.length === 0 && !loadingTables && !tableError && (
          <p>No tables found yet. Connect to a DB to explore.</p>
        )}
      </div>
    </>
  )
}
