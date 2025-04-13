import React, { useState } from 'react';
import NotebookCell from './Notebookcell';

const NotebookContainer = () => {
  const [cells, setCells] = useState([
    { id: Date.now(), code: '', language: 'python' }
  ]);

  const addCell = () => {
    setCells([
      ...cells,
      { id: Date.now(), code: '', language: 'python' }
    ]);
  };

  const updateCell = (id, field, value) => {
    setCells(cells.map(cell =>
      cell.id === id ? { ...cell, [field]: value } : cell
    ));
  };

  return (
    <div>
      {cells.map((cell) => (
        <NotebookCell
          key={cell.id}
          value={cell.code}
          setValue={(val) => updateCell(cell.id, 'code', val)}
          language={cell.language}
          setLanguage={(lang) => updateCell(cell.id, 'language', lang)}
        />
      ))}

      <button onClick={addCell} style={{ marginTop: '20px' }}>➕ Add Cell</button>
    </div>
  );
};

export default NotebookContainer;
