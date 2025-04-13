export default function Sidebar() {
    return (
      <div className="w-64 h-screen bg-gray-50 border-r shadow-sm flex flex-col">
        {/* Top content */}
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-6">BH-User</h2>
        </div>
  
        <div className="flex-grow"></div>
  
        <div className="px-4 pb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
            Configurations
          </p>
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-2 px-3 py-2 w-full rounded text-gray-700 hover:bg-gray-100">
              <span>📁</span> Data Sources
            </button>
            <button className="flex items-center gap-2 px-3 py-2 w-full rounded text-gray-700 hover:bg-gray-100">
              <span>⚙️</span> Settings
            </button>
            <button className="flex items-center gap-2 px-3 py-2 w-full rounded text-gray-700 hover:bg-gray-100">
              <span>👤</span> Default User
            </button>
          </div>
        </div>
      </div>
    );
  }
  