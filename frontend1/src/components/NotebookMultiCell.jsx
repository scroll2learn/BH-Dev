import React, { useState } from 'react'; 
import NotebookCell from './Notebookcell';
import ConnectDataSource from './components/ConnectDataSource'; 

const NotebookMultiCell = () => {
  const [cells, setCells] = useState([
    { id: 1, code: "print('Hello')", language: "python" }
  ]);

  const addCell = () => {
    setCells([
      ...cells,
      { id: Date.now(), code: "", language: "python" }
    ]);
  };

  const updateCell = (id, updated) => {
    setCells(cells.map(cell => cell.id === id ? { ...cell, ...updated } : cell));
  };

  const saveNotebook = async () => {
    const blob = new Blob([JSON.stringify(cells, null, 2)], { type: "application/json" });
    const file = new File([blob], "notebook.json");
    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://localhost:8000/files/write?filePath=notebook.json", {
      method: "POST",
      body: formData
    });
    alert("Notebook saved");
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>My Notebook</h1>

      {/* Added Data Source Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <ConnectDataSource />
      </div>

      {cells.map(cell => (
        <NotebookCell
          key={cell.id}
          value={cell.code}
          language={cell.language}
          setValue={(newCode) => updateCell(cell.id, { code: newCode })}
          setLanguage={(newLang) => updateCell(cell.id, { language: newLang })}
        />
      ))}
      
      <div style={{ marginTop: '10px' }}>
        <button onClick={addCell}>➕ Add Cell</button>
        <button onClick={saveNotebook} style={{ marginLeft: '10px' }}>💾 Save Notebook</button>
      </div>
    </div>
  );
};

export default NotebookMultiCell;
