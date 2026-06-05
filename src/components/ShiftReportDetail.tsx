import React, { useState } from 'react';
import { ShiftReport, ShiftReportItem, ReportReceiptStatus } from '../types';
import { getShiftLabel, formatDate } from '../utils/dateUtils';

interface ShiftReportDetailProps {
  report: ShiftReport;
  onConfirm: (id: string, receivedBy: string) => void;
  onClose: () => void;
}

export const ShiftReportDetail: React.FC<ShiftReportDetailProps> = ({ report, onConfirm, onClose }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [receiverName, setReceiverName] = useState(report.nextOperator);

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600'
  };

  const priorityLabels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  };

  const ItemSection = ({ title, items, color, icon }: {
    title: string;
    items: ShiftReportItem[];
    color: string;
    icon: string;
  }) => (
    <div className="mb-6">
      <div className={`flex items-center gap-2 mb-3 p-3 rounded-lg ${color}`}>
        <span className="text-lg">{icon}</span>
        <span className="font-semibold">{title}</span>
        <span className="ml-auto bg-white bg-opacity-60 px-3 py-1 rounded-full text-sm font-medium">
          共 {items.length} 项
        </span>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-gray-400">暂无事项</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-500">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-gray-800">{item.title}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${priorityColors[item.priority]}`}>
                      {priorityLabels[item.priority]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <span>👤</span>
                      责任人: {item.assignee}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>⏰</span>
                      截止: {formatDate(item.deadline)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                交班报详情
              </h2>
              {report.receiptStatus === ReportReceiptStatus.RECEIVED ? (
                <span className="px-2 py-0.5 text-xs font-medium rounded border bg-green-100 text-green-700 border-green-300">
                  ✓ 已接收
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-medium rounded border bg-orange-100 text-orange-700 border-orange-300">
                  ⏳ 待接收
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              生成于 {formatDate(report.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow text-gray-500 hover:text-gray-700 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">{report.date}</h3>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20`}>
                  {getShiftLabel(report.shiftType)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-80">交班时间</div>
                <div className="font-semibold">{formatDate(report.handoverTime)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white border-opacity-20">
              <div>
                <div className="text-sm opacity-80">交班人</div>
                <div className="font-semibold text-lg">{report.operator}</div>
              </div>
              <div>
                <div className="text-sm opacity-80">接班人</div>
                <div className="font-semibold text-lg">{report.nextOperator}</div>
              </div>
            </div>
            {report.receiptStatus === ReportReceiptStatus.RECEIVED && report.receivedAt && (
              <div className="mt-4 pt-4 border-t border-white border-opacity-20 bg-white bg-opacity-10 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-lg">✓</span>
                  <span className="opacity-80">已于 {formatDate(report.receivedAt)} 由 {report.receivedBy} 确认接收</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
              <div className="text-3xl font-bold text-green-600">
                {report.newItems.length}
              </div>
              <div className="text-sm text-green-600 font-medium mt-1">今日新增</div>
            </div>
            <div className="bg-teal-50 rounded-xl p-4 text-center border border-teal-100">
              <div className="text-3xl font-bold text-teal-600">
                {report.completedItems.length}
              </div>
              <div className="text-sm text-teal-600 font-medium mt-1">今日完成</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
              <div className="text-3xl font-bold text-yellow-600">
                {report.pendingItems.length}
              </div>
              <div className="text-sm text-yellow-600 font-medium mt-1">遗留待办</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📝</span>
              <span className="font-semibold text-gray-700">交班小结</span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{report.summary}</p>
          </div>

          <ItemSection
            title="今日新增事项"
            items={report.newItems}
            color="bg-green-100 text-green-700"
            icon="🆕"
          />

          <ItemSection
            title="今日完成事项"
            items={report.completedItems}
            color="bg-teal-100 text-teal-700"
            icon="✅"
          />

          <ItemSection
            title="遗留待办事项"
            items={report.pendingItems}
            color="bg-yellow-100 text-yellow-700"
            icon="⏳"
          />
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          {report.receiptStatus !== ReportReceiptStatus.RECEIVED && (
            <button
              onClick={() => {
                setReceiverName(report.nextOperator);
                setShowConfirmDialog(true);
              }}
              className="flex-1 px-4 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              确认接收
            </button>
          )}
          <button
            onClick={onClose}
            className={`${report.receiptStatus !== ReportReceiptStatus.RECEIVED ? 'flex-1' : 'w-full'} px-4 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors`}
          >
            关闭
          </button>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">确认交接</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                接收人姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="请输入接收人姓名"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                确认后将标记该交班报为已接收，并记录接收时间。
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setReceiverName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (receiverName.trim()) {
                    onConfirm(report.id, receiverName.trim());
                    setShowConfirmDialog(false);
                    setReceiverName('');
                  }
                }}
                className="flex-1 px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!receiverName.trim()}
              >
                确认接收
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
