import React, { useState } from 'react';
import NotebookCell from './components/Notebookcell';
import { useForm } from 'react-hook-form';
import './App.css';
import { callGemini } from '../src/geminiClient';


// Visualization component placeholder
const VisualizationView = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200 p-6 text-center mt-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Visualization</h3>
      <p className="text-gray-500 mb-2">Coming soon...</p>
      <p className="text-sm text-gray-400">Our data visualization tools are under development.</p>
      <div className="mt-6">
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

// Siri-like Animation Component
const SiriAnimation = () => {
  return (
    <div className="siri-anim">
      <div className="siri-bar"></div>
      <div className="siri-bar"></div>
      <div className="siri-bar"></div>
      <div className="siri-bar"></div>
    </div>
  );
};

const AiQueryForm = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { query: '' }
  });

  const [isHovered, setIsHovered] = useState(false);
  const [response, setResponse] = useState('');

  const onSubmit = async (data) => {
    try {
      const reply = await callGemini(data.query);
      alert('🤖 Gemini says:\n' + reply);
    } catch (err) {
      alert('❌ Error from Gemini: ' + err.message);
    } finally {
      reset();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-auto flex gap-2 w-full">
        <div className="flex-1 relative">
          <input
            {...register('query', {
              required: 'Please enter a question',
              minLength: { value: 2, message: 'Query too short' }
            })}
            type="text"
            placeholder="Ask me your questions..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.query && (
            <span className="text-xs text-red-500 absolute -bottom-5 left-0">
              {errors.query.message}
            </span>
          )}
        </div>
        <button
          style={{ backgroundColor: '#DEFF80' }}
          type="submit"
          className="px-3 py-2 rounded ai-button flex items-center gap-1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isSubmitting}
        >
          <span className="text-nowrap">
            {isSubmitting ? 'Thinking...' : 'Ask AI'}
          </span>
          <SiriAnimation />
        </button>
      </form>

      {/* Optional display of result */}
      {response && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          <strong>AI Response:</strong> {response}
        </div>
      )}
    </>
  );
};

// Datasource Connection Form Component
const DataSourceForm = ({ onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      datasourceType: 'PostgreSQL',
      displayName: '',
      host: '',
      port: '',
      databaseName: '',
      username: '',
      password: ''
    }
  });

  const onSubmit = async (formData) => {
    try {
      const res = await fetch('http://localhost:8000/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const result = await res.json();
  
      if (res.ok) {
        alert("✅ " + result.message);
        onClose(); // close modal
      } else {
        alert("❌ " + result.detail);
      }
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Datasource Type</label>
        <select 
          {...register('datasourceType', { required: 'This field is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
        >
          <option value="PostgreSQL">PostgreSQL</option>
          <option value="MySQL">MySQL</option>
          <option value="MongoDB">MongoDB</option>
          <option value="BigQuery">BigQuery</option>
          <option value="Snowflake">Snowflake</option>
        </select>
        {errors.datasourceType && <p className="text-red-500 text-xs mt-1">{errors.datasourceType.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
        <input 
          type="text" 
          {...register('displayName', { 
            required: 'Display name is required',
          })}
          placeholder="My Database Connection" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none" 
        />
        {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
        <input 
          type="text" 
          {...register('host', { 
            required: 'Host is required',
          })}
          placeholder="localhost or 127.0.0.1" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none" 
        />
        {errors.host && <p className="text-red-500 text-xs mt-1">{errors.host.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
        <input 
          type="text" 
          {...register('port', { 
            required: 'Port is required',
            pattern: {
              value: /^[0-9]+$/,
              message: 'Please enter a valid port number'
            }
          })}
          placeholder="5432" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none" 
        />
        {errors.port && <p className="text-red-500 text-xs mt-1">{errors.port.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Database Name</label>
        <input 
          type="text" 
          {...register('databaseName', { 
            required: 'Database name is required',
          })}
          placeholder="my_database" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none" 
        />
        {errors.databaseName && <p className="text-red-500 text-xs mt-1">{errors.databaseName.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input 
          type="text" 
          {...register('username', { 
            required: 'Username is required',
          })}
          placeholder="username" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none" 
        />
        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input 
          type="password" 
          {...register('password', { 
            required: 'Password is required',
          })}
          placeholder="••••••••" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none" 
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <button 
          type="button"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50" 
          onClick={onClose}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Connect
        </button>
      </div>
    </form>
  );
};

function App() {
  const [cells, setCells] = useState([
    { id: 1, value: '', language: 'python' }
  ]);
  
  const [isAskHovered, setIsAskHovered] = useState(false);

  const addCell = () => {
    const newId = cells.length > 0 ? Math.max(...cells.map(cell => cell.id)) + 1 : 1;
    setCells([...cells, { id: newId, value: '', language: 'python' }]);
  };

  const updateCellValue = (id, newValue) => {
    setCells(cells.map(cell => cell.id === id ? { ...cell, value: newValue } : cell));
  };

  const updateCellLanguage = (id, newLang) => {
    setCells(cells.map(cell => cell.id === id ? { ...cell, language: newLang } : cell));
  };

  const deleteCell = (id) => {
    setCells(cells.filter(cell => cell.id !== id));
  };

  const [activeTab, setActiveTab] = useState('notebook');
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Render appropriate content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'visualization':
        return <VisualizationView />;
      case 'notebook':
      default:
        return (
          <>
            {cells.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 bg-white rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500 mb-4">No cells yet. Add your first cell to get started.</p>
                <button 
                style={{ backgroundColor: '#DEFF80' }}
                  className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-600 border-0 shadow-sm" 
                  onClick={addCell}
                >
                  <span>➕ Add First Cell</span> 
                </button>
              </div>
            ) : (
              cells.map((cell) => (
                <NotebookCell
                  key={cell.id}
                  cellId={cell.id}
                  value={cell.value}
                  setValue={(val) => updateCellValue(cell.id, val)}
                  language={cell.language}
                  setLanguage={(lang) => updateCellLanguage(cell.id, lang)}
                  onDelete={() => deleteCell(cell.id)}
                />
              ))
            )}
            
            {cells.length > 0 && (
              <div className="mt-6 flex justify-center">
                <button 
                  style={{ backgroundColor: '#DEFF80' }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-50 shadow-sm" 
                  onClick={addCell}
                >
                  <span>➕</span> Add Cell
                </button>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden border-box">
      {/* Left Panel - BH-User */}
      <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
        <div className="p-2 border-gray-200 m-auto">
          <img className='h-[85%]' src="./Image.jpg" alt="Big-hammer-logo" />
          {/* <h2 className="text-2xl font-bold">BH-User</h2> */}
        </div>
        <div className="flex-grow"></div>
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-4">Configurations</p>
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-2 text-left p-2 hover:bg-gray-100 rounded border-0">
              <span>📁</span> Data Sources
            </button>
            <button className="flex items-center gap-2 text-left p-2 hover:bg-gray-100 rounded border-0">
              <span>⚙️</span> Settings
            </button>
            <button className="flex items-center gap-2 text-left p-2 hover:bg-gray-100 rounded border-0">
              <span>👤</span> Default User
            </button>
          </div>
        </div>
      </div>

      {/* Center Panel - Notebook */}
      <div className="flex-1 bg-gray-50 border-r border-gray-200 flex flex-col overflow-auto">
        <div className="flex justify-between p-4 border-b border-gray-200 bg-white shadow-sm" >
          <h2 className="text-2xl font-bold">{activeTab[0].toUpperCase() + activeTab.slice(1)}</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('notebook')} 
              className={`px-3 py-1 rounded-t-lg hover:bg-gray-100 ${activeTab === 'notebook' ? 'bg-gray-200 font-medium' : ''}`}
            >
              Notebook
            </button>
            <button 
              onClick={() => setActiveTab('visualization')} 
              className={`px-3 py-1 rounded-t-lg hover:bg-gray-100 ${activeTab === 'visualization' ? 'bg-gray-200 font-medium' : ''}`}
            >
              Visualization
            </button>
          </div>
          <button 
          style={{ backgroundColor: '#DEFF80' }}
            className="flex items-center gap-1 px-3  py-1.5 rounded shadow-sm hover:shadow hover:from-green-600 hover:to-green-700 transition-all duration-200"
            onClick={() => setShowConnectModal(true)}
          >
            <span className="text-sm ">🔌</span> Connect Datasource
          </button>
        </div>
        <div className="p-6 flex-grow max-w-4xl mx-auto w-full">
          {renderContent()}
        </div>
      </div>

      {/* Right Panel - AI Assistance */}
      <div className="w-80 h-full bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold">AI Assistance</h3>
          </div>
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <p className="text-sm text-gray-600 mb-2">Hi! I'm your AI assistant. Ask me your questions.</p>          
          <AiQueryForm />
        </div>
      </div>
      
      {/* Connect Datasource Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Connect Datasource</h3>
              <button 
                className="text-gray-500 hover:text-gray-700" 
                onClick={() => setShowConnectModal(false)}
              >
                ✕
              </button>
            </div>
            <DataSourceForm onClose={() => setShowConnectModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
