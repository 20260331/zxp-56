import React, { useState, useMemo } from 'react';
import { ShiftReport, ReportReceiptStatus, HandoverItem, RiskStatus } from '../types';
import { getShiftLabel, formatDate } from '../utils/dateUtils';

interface ShiftReportHistoryProps {
  reports: ShiftReport[];
  items: HandoverItem[];
  onViewDetail: (report: ShiftReport) => void;
  onDelete: (id: string) => void;
  onConfirm: (id: string, receivedBy: string) => void;
  onClose: () => void;
}

export const ShiftReportHistory: React.FC<ShiftReportHistoryProps> = ({ 
  reports, 
  items,
  onViewDetail, 
  onDelete,
  onConfirm,
  onClose 
}) => {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [receiverName, setReceiverName] = useState('');

  const shiftColors: Record<string, string> = {
    morning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    afternoon: 'bg-blue-100 text-blue-700 border-blue-300',
    night: 'bg-purple-100 text-purple-700 border-purple-300'
  };

  const itemMap = useMemo(() => {
    const map = new Map<string, HandoverItem>();
    items.forEach(item => map.set(item.id, item));
    return map;
  }, [items]);

  const getReportLiveRiskInfo = (report: ShiftReport) => {
    const snapshotRiskCount = report.riskItems?.length || 0;
    if (snapshotRiskCount === 0) {
      return { snapshotRiskCount, stillOpenCount: 0, allResolved: true, hasAnyRisk: false };
    }
    let stillOpenCount = 0;
    (report.riskItems || []).forEach(riskItem => {
      const liveItem = itemMap.get(riskItem.id);
      if (!liveItem) {
        stillOpenCount++;
        return;
      }
      if (liveItem.isRisk && liveItem.riskStatus === RiskStatus.OPEN) {
        stillOpenCount++;
      }
    });
    return { 
      snapshotRiskCount, 
      stillOpenCount, 
      allResolved: stillOpenCount === 0,
      hasAnyRisk: true
    };
  };

  const getReceiptBadge = (report: ShiftReport) => {
    if (report.receiptStatus === ReportReceiptStatus.RECEIVED) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded border bg-green-100 text-green-700 border-green-300">
          ✓ 已接收
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded border bg-orange-100 text-orange-700 border-orange-300">
        ⏳ 待接收
      </span>
    );
  };

  const getRiskBadge = (report: ShiftReport) => {
    const riskInfo = getReportLiveRiskInfo(report);
    if (!riskInfo.hasAnyRisk) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded border bg-green-100 text-green-700 border-green-300">
          ✓ 无未解除风险
        </span>
      );
    }
    if (riskInfo.allResolved) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded border bg-teal-100 text-teal-700 border-teal-300">
          ✓ 交班时 {riskInfo.snapshotRiskCount} 项风险已全部解除
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs font-bold rounded border bg-red-600 text-white border-red-700 animate-pulse">
        ⚠️ {riskInfo.stillOpenCount} 项风险仍未解除
      </span>
    );
  };

  const getReportRiskItems = (report: ShiftReport) => {
    return (report.riskItems || []).map(snapshotItem => {
      const liveItem = itemMap.get(snapshotItem.id);
      const isStillOpen = liveItem 
        ? liveItem.isRisk && liveItem.riskStatus === RiskStatus.OPEN
        : snapshotItem.riskStatus === RiskStatus.OPEN;
      return { ...snapshotItem, isStillOpen };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              历史交班报
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-gray-500">
                <span className="inline-block w-3 h-3 rounded-full bg-red-600"></span>
                <span>= 仍有未解除风险</span>
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <span className="inline-block w-3 h-3 rounded-full bg-teal-500"></span>
                <span>= 风险已全部解除</span>
              </span>
            </div>
          </div>
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
              {reports.map((report) => {
                const riskInfo = getReportLiveRiskInfo(report);
                const riskItemsWithLiveStatus = getReportRiskItems(report);
                const stillOpen = riskInfo.hasAnyRisk && !riskInfo.allResolved;
                const wasRiskButResolved = riskInfo.hasAnyRisk && riskInfo.allResolved;
                
                return (
                  <div
                    key={report.id}
                    className={`p-5 border-2 rounded-xl hover:shadow-md transition-all duration-200 ${
                      stillOpen
                        ? 'border-red-400 bg-red-50 hover:bg-red-100'
                        : wasRiskButResolved
                          ? 'border-teal-300 bg-teal-50 hover:bg-teal-100'
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`text-3xl ${stillOpen ? 'animate-pulse' : ''}`}>
                          {stillOpen ? '🚨' : wasRiskButResolved ? '✅' : '📋'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-800 text-lg">
                              {report.date} 交班报
                            </h3>
                            {getReceiptBadge(report)}
                            {getRiskBadge(report)}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${shiftColors[report.shiftType]}`}>
                              {getShiftLabel(report.shiftType)}
                            </span>
                            <span className="text-sm text-gray-500">
                              交班人: {report.operator} → 接班人: {report.nextOperator}
                            </span>
                          </div>
                          {report.receiptStatus === ReportReceiptStatus.RECEIVED && report.receivedAt && (
                            <div className="text-xs text-green-600 mt-1">
                              接收人: {report.receivedBy} · {formatDate(report.receivedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        生成于 {formatDate(report.createdAt)}
                      </span>
                    </div>

                    <div className={`grid gap-3 mb-4 ${
                      riskInfo.hasAnyRisk ? 'grid-cols-4' : 'grid-cols-3'
                    }`}>
                      {riskInfo.hasAnyRisk && (
                        <div className={`rounded-lg p-3 text-center border ${
                          stillOpen 
                            ? 'bg-red-100 border-red-200' 
                            : 'bg-teal-100 border-teal-200'
                        }`}>
                          <div className={`text-2xl font-bold ${
                            stillOpen ? 'text-red-600' : 'text-teal-600'
                          }`}>
                            {stillOpen ? riskInfo.stillOpenCount : 0}
                            <span className="text-sm font-normal text-gray-500 ml-1">/ {riskInfo.snapshotRiskCount}</span>
                          </div>
                          <div className={`text-xs font-medium ${
                            stillOpen ? 'text-red-600' : 'text-teal-600'
                          }`}>
                            {stillOpen ? '仍未解除 / 交班时' : '已全部解除 / 交班时'}
                          </div>
                        </div>
                      )}
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

                    {riskInfo.hasAnyRisk && riskItemsWithLiveStatus.length > 0 && (
                      <div className={`mb-4 p-3 rounded-lg border ${
                        stillOpen 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-teal-50 border-teal-200'
                      }`}>
                        <div className={`text-xs font-semibold mb-2 ${
                          stillOpen ? 'text-red-700' : 'text-teal-700'
                        }`}>
                          {stillOpen ? '⚠️ 未解除风险事项：' : '✓ 交班时风险（已全部解除）：'}
                        </div>
                        <div className="space-y-1">
                          {riskItemsWithLiveStatus.slice(0, 3).map(item => (
                            <div key={item.id} className="flex items-start gap-1 text-xs">
                              <span>{item.isStillOpen ? '🔴' : '🟢'}</span>
                              <span className={item.isStillOpen ? 'text-red-700' : 'text-teal-700'}>
                                <span className="font-medium">{item.title}</span>
                                {item.followUpPlan && (
                                  <span className={item.isStillOpen ? 'text-red-600' : 'text-teal-600'}>
                                    {' '}- 跟进: {item.followUpPlan}
                                  </span>
                                )}
                                <span className={`ml-2 ${item.isStillOpen ? 'text-red-500' : 'text-teal-500'}`}>
                                  [{item.isStillOpen ? '仍未解除' : '已解除'}]
                                </span>
                              </span>
                            </div>
                          ))}
                          {riskItemsWithLiveStatus.length > 3 && (
                            <div className={`text-xs mt-1 ${stillOpen ? 'text-red-600' : 'text-teal-600'}`}>
                              ...还有 {riskItemsWithLiveStatus.length - 3} 项，请查看详情
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewDetail(report)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                      >
                        查看详情
                      </button>
                      {report.receiptStatus !== ReportReceiptStatus.RECEIVED && (
                        <button
                          onClick={() => {
                            setConfirmingId(report.id);
                            setReceiverName(report.nextOperator);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                        >
                          确认接收
                        </button>
                      )}
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {confirmingId && (
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
                  setConfirmingId(null);
                  setReceiverName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (receiverName.trim()) {
                    onConfirm(confirmingId, receiverName.trim());
                    setConfirmingId(null);
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
