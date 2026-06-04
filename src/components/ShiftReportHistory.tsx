import React from 'react';
import { ShiftReport } from '../types';
import { getShiftLabel, formatDate } from '../utils/dateUtils';

interface ShiftReportHistoryProps {
  reports: ShiftReport[];
  onViewDetail: (report: ShiftReport) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const ShiftReportHistory: React.FC<ShiftReportHistoryProps> = ({ 
  reports, 
  onViewDetail, 
  onDelete,
  onClose 
}) => {
  const shiftColors: Record<string, string> = {
    morning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    afternoon: 'bg-blue-100 text-blue-700 border-blue-300',
    night: 'bg-purple-100 text-purple-700 border-purple-300'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            历史交班报
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {reports.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">暂无交班报记录</p>
              <p className="text-gray-400 text-sm mt-2">点击"交班"按钮生成第一份交班报</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">📋</div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {report.date} 交班报
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${shiftColors[report.shiftType]}`}>
                            {getShiftLabel(report.shiftType)}
                          </span>
                          <span className="text-sm text-gray-500">
                            交班人: {report.operator} → 接班人: {report.nextOperator}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      生成于 {formatDate(report.createdAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {report.newItems.length}
                      </div>
                      <div className="text-xs text-green-600 font-medium">今日新增</div>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-teal-600">
                        {report.completedItems.length}
                      </div>
                      <div className="text-xs text-teal-600 font-medium">今日完成</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {report.pendingItems.length}
                      </div>
                      <div className="text-xs text-yellow-600 font-medium">遗留待办</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-xs font-medium text-gray-500 mb-1">交班小结</div>
                    <p className="text-sm text-gray-700 line-clamp-2">{report.summary}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewDetail(report)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('确定要删除这份交班报吗？')) {
                          onDelete(report.id);
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
