import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import "./Notebookcell.css";

const NotebookCell = ({ value, setValue, language, setLanguage, onDelete }) => {
  const [output, setOutput] = useState("No output");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setOutput("No output");
  }, [language]);

  const runCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/execute", {
        code: value,
        language: language,
      });

      if (response?.data?.output !== undefined) {
        setOutput(response.data.output || "No output");
      } else {
        setOutput("Error: Unexpected response structure from backend.");
      }
    } catch (err) {
      console.error("Error executing code:", err.message);
      setOutput("Error: Network issue or server is not responding.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg mb-5 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </span>
          <button 
            onClick={toggleExpand} 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
          >
            {isExpanded ? "🔼" : "🔽"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
          >
            <option value="python">Python</option>
            <option value="sql">SQL</option>
            <option value="javascript">JavaScript</option>
          </select>
          <button 
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 border-0 shadow-sm"
            onClick={runCode}
          >
            ▶ Run
          </button>
          {(isHovered || window.innerWidth < 768) && (
            <button 
              className="text-red-500 hover:text-red-700 p-1 rounded-full"
              onClick={onDelete}
              title="Delete cell"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="p-0 transition-all duration-200" style={{ opacity: isExpanded ? 0.7 : 1 }}>
        <MonacoEditor
          height={isExpanded ? "200px" : language === "sql" ? "100px" : "40px"}
          language={language}
          theme="vs-light"
          value={value}
          onChange={setValue}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            overviewRulerBorder: false,
            padding: { top: 8, bottom: 8 },
            lineNumbers: isExpanded ? "on" : "off",
            folding: isExpanded,
            contextmenu: true,
            placeholder:
              language === "python"
                ? "Enter your Python code here..."
                : language === "sql"
                ? "Enter your SQL query here..."
                : "Enter your JavaScript code here...",
            scrollbar: {
              horizontal: "auto",
              vertical: isExpanded ? "auto" : "hidden",
              handleMouseWheel: isExpanded,
              useShadows: isExpanded,
              horizontalScrollbarSize: isExpanded ? 12 : 0,
              verticalScrollbarSize: isExpanded ? 12 : 0,
            },
          }}
        />
      </div>

      {(output !== "No output" || loading) && (
        <div className="border-t border-gray-200">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Output</span>
            {output !== "No output" && !loading && (
              <button
                onClick={() => setOutput("No output")}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
          <pre className="p-3 bg-gray-50 text-sm overflow-auto max-h-60">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="animate-pulse">⏳</span> Running...
              </div>
            ) : typeof output === "string" ? (
              output
            ) : (
              JSON.stringify(output, null, 2)
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default NotebookCell;
