export default function AiPanel() {
    return (
      <div className="w-80 h-screen bg-gray-50 border-l shadow-sm flex flex-col">
        {/* Header + Intro */}
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">BH-AI Assistance</h2>
          <p className="text-sm text-gray-700 mb-3">
            Hi! I’m your AI assistant. Ask me your questions.
          </p>
          <p className="text-base font-medium text-gray-800">Welcome! Ask me Anything.</p>
        </div>
  
        {/* Spacer to push the prompt to the bottom */}
        <div className="flex-1" />
  
        {/* Prompt input pinned to bottom */}
        <div className="border-t p-3 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask me your questions..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none text-sm"
          />
          <button className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm">
            🔍
          </button>
        </div>
      </div>
    );
  }
  