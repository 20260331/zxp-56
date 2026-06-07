import React from 'react';

interface HeaderProps {
  onAddItem: () => void;
  onHandover: () => void;
  onViewHistory: () => void;
  openRiskCount?: number;
  criticalRiskCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onAddItem, 
  onHandover, 
  onViewHistory, 
  openRiskCount = 0,
  criticalRiskCount = 0
}) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const hasRisk = openRiskCount > 0;

  return (
    <header className={`${
      hasRisk && criticalRiskCount > 0 
        ? 'bg-gradient-to-r from-red-600 to-orange-600' 
        : hasRisk 
          ? 'bg-gradient-to-r from-orange-600 to-amber-600'
          : 'bg-gradient-to-r from-blue-600 to-blue-700'
    } text-white shadow-lg transition-all duration-500`}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-3xl">{hasRisk && criticalRiskCount > 0 ? '🚨' : hasRisk ? '⚠️' : '📋'}</span>
                值班交接系统
              </h1>
              {hasRisk && (
                <span className={`px-3 py-1 text-sm font-bold rounded-full animate-pulse ${
                  criticalRiskCount > 0 
                    ? 'bg-white text-red-600' 
                    : 'bg-white bg-opacity-20 text-white'
                }`}>
                  ⚠️ {openRiskCount} 项风险未解除
                </span>
              )}
            </div>
            <p className={`mt-1 ${hasRisk ? 'text-orange-100' : 'text-blue-100'}`}>{dateStr}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onHandover}
              className={`flex items-center justify-center gap-2 px-5 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${
                hasRisk 
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <span>🤝</span>
              {hasRisk ? '交班（含风险）' : '交班'}
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
