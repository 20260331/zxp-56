import React from 'react';

interface HeaderProps {
  onAddItem: () => void;
  onHandover: () => void;
  onViewHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddItem, onHandover, onViewHistory }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">📋</span>
              值班交接系统
            </h1>
            <p className="text-blue-100 mt-1">{dateStr}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onHandover}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-green-600 transition-all duration-200"
            >
              <span>🤝</span>
              交班
            </button>
            <button
              onClick={onViewHistory}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white bg-opacity-20 text-white font-semibold rounded-lg hover:bg-opacity-30 transition-all duration-200"
            >
              <span>📚</span>
              历史
            </button>
            <button
              onClick={onAddItem}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-200"
            >
              <span className="text-xl">+</span>
              新增交接事项
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
