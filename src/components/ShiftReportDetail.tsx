import React, { useState, useMemo } from 'react';
import { ShiftReport, ShiftReportItem, ReportReceiptStatus, HandoverItem, RiskStatus } from '../types';
import { getShiftLabel, formatDate } from '../utils/dateUtils';

interface ShiftReportDetailProps {
  report: ShiftReport;
  items: HandoverItem[];
  onConfirm: (id: string, receivedBy: string) => void;
  onRiskFeedback: (reportId: string, itemId: string, feedback: string, feedbackBy: string) => void;
  onClose: () => void;
}

export const ShiftReportDetail: React.FC<ShiftReportDetailProps> = ({ report, items, onConfirm, onRiskFeedback, onClose }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [receiverName, setReceiverName] = useState(report.nextOperator);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [feedbackByInputs, setFeedbackByInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    (report.riskItems || []).forEach(item => {
      initial[item.id] = report.nextOperator;
    });
    return initial;
  });
  const [submittingItemId, setSubmittingItemId] = useState<string | null>(null);

  const isReportReceived = report.receiptStatus === ReportReceiptStatus.RECEIVED;

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

  const riskLevelLabels: Record<string, string> = {
    none: '无',
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  };

  const riskLevelColors: Record<string, string> = {
    none: 'bg-gray-100 text-gray-600',
    low: 'bg-yellow-100 text-yellow-700',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700',
    critical: 'bg-red-600 text-white'
  };

  const itemMap = useMemo(() => {
    const map = new Map<string, HandoverItem>();
    items.forEach(item => map.set(item.id, item));
    return map;
  }, [items]);

  const riskInfo = useMemo(() => {
    const snapshotRiskCount = report.riskItems?.length || 0;
    if (snapshotRiskCount === 0) {
      return { snapshotRiskCount, stillOpenCount: 0, allResolved: true, hasAnyRisk: false, feedbackCount: 0, pendingFeedbackCount: 0 };
    }
    let stillOpenCount = 0;
    let feedbackCount = 0;
    (report.riskItems || []).forEach(riskItem => {
      const liveItem = itemMap.get(riskItem.id);
      if (!liveItem) {
        stillOpenCount++;
      } else if (liveItem.isRisk && liveItem.riskStatus === RiskStatus.OPEN) {
        stillOpenCount++;
      }
      if (riskItem.riskFeedback && riskItem.riskFeedback.trim()) {
        feedbackCount++;
      }
    });
    return { 
      snapshotRiskCount, 
      stillOpenCount, 
      allResolved: stillOpenCount === 0,
      hasAnyRisk: true,
      feedbackCount,
      pendingFeedbackCount: snapshotRiskCount - feedbackCount
    };
  }, [report, itemMap]);

  const stillOpen = riskInfo.hasAnyRisk && !riskInfo.allResolved;
  const wasRiskButResolved = riskInfo.hasAnyRisk && riskInfo.allResolved;

  const getRiskItemsWithLiveStatus = () => {
    return (report.riskItems || []).map(snapshotItem => {
      const liveItem = itemMap.get(snapshotItem.id);
      const isStillOpen = liveItem 
        ? liveItem.isRisk && liveItem.riskStatus === RiskStatus.OPEN
        : snapshotItem.riskStatus === RiskStatus.OPEN;
      const hasFeedback = !!(snapshotItem.riskFeedback && snapshotItem.riskFeedback.trim());
      return { ...snapshotItem, isStillOpen, hasFeedback };
    });
  };

  const riskItemsWithLiveStatus = getRiskItemsWithLiveStatus();

  const handleSubmitFeedback = (itemId: string) => {
    if (!isReportReceived) return;
    const feedback = feedbackInputs[itemId] || '';
    const feedbackBy = feedbackByInputs[itemId] || '';
    if (!feedback.trim()) return;
    if (!feedbackBy.trim()) return;
    setSubmittingItemId(itemId);
    onRiskFeedback(report.id, itemId, feedback.trim(), feedbackBy.trim());
    setFeedbackInputs(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setFeedbackByInputs(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setTimeout(() => setSubmittingItemId(null), 300);
  };

  const RiskItemSection = ({ title, items, color, icon }: {
    title: string;
    items: (ShiftReportItem & { isStillOpen?: boolean; hasFeedback?: boolean })[];
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
        {riskInfo.hasAnyRisk && (
          <span className="bg-white bg-opacity-80 px-3 py-1 rounded-full text-sm font-medium text-indigo-700">
            已反馈 {riskInfo.feedbackCount} / 未反馈 {riskInfo.pendingFeedbackCount}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-gray-400">暂无事项</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className={`p-4 rounded-lg border hover:shadow-sm transition-shadow ${
                item.isStillOpen 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-teal-50 border-teal-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-500">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-gray-800">{item.title}</h4>
                      {item.isRisk && (
                        <span className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${riskLevelColors[item.riskLevel]}`}>
                          风险:{riskLevelLabels[item.riskLevel]}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded whitespace-nowrap font-medium ${
                        item.isStillOpen
                          ? 'bg-red-500 text-white'
                          : 'bg-teal-500 text-white'
                      }`}>
                        {item.isStillOpen ? '🔴 仍未解除' : '🟢 已解除'}
                      </span>
                      {item.hasFeedback ? (
                        <span className="px-2 py-0.5 text-xs rounded whitespace-nowrap font-medium bg-indigo-500 text-white">
                          ✓ 已反馈
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs rounded whitespace-nowrap font-medium bg-amber-500 text-white">
                          ⏳ 未反馈
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${priorityColors[item.priority]}`}>
                      {priorityLabels[item.priority]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                  {item.followUpPlan && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                      <p className="text-xs text-amber-800">
                        <span className="font-semibold">📋 跟进计划:</span> {item.followUpPlan}
                      </p>
                    </div>
                  )}
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

                  {item.hasFeedback && item.riskFeedback && (
                    <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <span className="text-xs font-semibold text-indigo-800 flex items-center gap-1">
                          <span>💬</span>
                          接班人处理意见（已反馈）
                        </span>
                        <span className="text-xs text-indigo-500">
                          {item.riskFeedbackBy && <>反馈人: {item.riskFeedbackBy} · </>}
                          {item.riskFeedbackAt && formatDate(item.riskFeedbackAt)}
                        </span>
                      </div>
                      <p className="text-sm text-indigo-700 whitespace-pre-wrap leading-relaxed">
                        {item.riskFeedback}
                      </p>
                    </div>
                  )}

                  {!item.hasFeedback && isReportReceived && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                          <span>✏️</span>
                          填写处理意见（未反馈）
                        </span>
                      </div>
                      <label className="block text-xs font-medium text-amber-700 mb-1">
                        反馈人
                      </label>
                      <input
                        type="text"
                        value={feedbackByInputs[item.id] ?? ''}
                        onChange={(e) => setFeedbackByInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className="w-full px-3 py-1.5 mb-2 text-sm border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white"
                        placeholder="请输入反馈人姓名"
                      />
                      <label className="block text-xs font-medium text-amber-700 mb-1">
                        处理意见 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={feedbackInputs[item.id] ?? ''}
                        onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none bg-white"
                        rows={3}
                        placeholder="请输入针对此风险的处理意见、应对措施等..."
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleSubmitFeedback(item.id)}
                          disabled={!feedbackInputs[item.id]?.trim() || !feedbackByInputs[item.id]?.trim() || submittingItemId === item.id}
                          className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingItemId === item.id ? '提交中...' : '提交反馈'}
                        </button>
                      </div>
                    </div>
                  )}

                  {!item.hasFeedback && !isReportReceived && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>🔒</span>
                        <span className="font-medium">待接班人确认接收后，方可填写处理意见</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ItemSection = ({ title, items, color, icon, showRiskInfo = false, showLiveStatus = false }: {
    title: string;
    items: (ShiftReportItem & { isStillOpen?: boolean; hasFeedback?: boolean })[];
    color: string;
    icon: string;
    showRiskInfo?: boolean;
    showLiveStatus?: boolean;
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
            <div 
              key={item.id} 
              className={`p-4 rounded-lg border hover:shadow-sm transition-shadow ${
                showLiveStatus 
                  ? item.isStillOpen 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-teal-50 border-teal-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-500">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-gray-800">{item.title}</h4>
                      {showRiskInfo && item.isRisk && (
                        <span className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${riskLevelColors[item.riskLevel]}`}>
                          风险:{riskLevelLabels[item.riskLevel]}
                        </span>
                      )}
                      {showLiveStatus && (
                        <span className={`px-2 py-0.5 text-xs rounded whitespace-nowrap font-medium ${
                          item.isStillOpen
                            ? 'bg-red-500 text-white'
                            : 'bg-teal-500 text-white'
                        }`}>
                          {item.isStillOpen ? '🔴 仍未解除' : '🟢 已解除'}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${priorityColors[item.priority]}`}>
                      {priorityLabels[item.priority]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                  {showRiskInfo && item.followUpPlan && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                      <p className="text-xs text-amber-800">
                        <span className="font-semibold">📋 跟进计划:</span> {item.followUpPlan}
                      </p>
                    </div>
                  )}
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
        <div className={`p-6 border-b border-gray-200 flex items-center justify-between ${
          stillOpen 
            ? 'bg-gradient-to-r from-red-500 to-orange-500' 
            : wasRiskButResolved
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50'
        }`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${
                (stillOpen || wasRiskButResolved) ? 'text-white' : 'text-gray-800'
              }`}>
                <span className="text-2xl">
                  {stillOpen ? '🚨' : wasRiskButResolved ? '✅' : '📋'}
                </span>
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
              {riskInfo.hasAnyRisk && riskInfo.pendingFeedbackCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded border bg-white text-amber-600 border-amber-300 animate-pulse">
                  ⏳ {riskInfo.pendingFeedbackCount} 项风险待反馈
                </span>
              )}
              {riskInfo.hasAnyRisk && riskInfo.pendingFeedbackCount === 0 && riskInfo.feedbackCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded border bg-white text-indigo-700 border-indigo-300">
                  ✓ {riskInfo.feedbackCount} 项风险已全部反馈
                </span>
              )}
              {stillOpen && (
                <span className="px-2 py-0.5 text-xs font-bold rounded border bg-white text-red-600 border-red-300 animate-pulse">
                  ⚠️ {riskInfo.stillOpenCount} 项风险仍未解除
                </span>
              )}
              {wasRiskButResolved && (
                <span className="px-2 py-0.5 text-xs font-medium rounded border bg-white text-teal-700 border-teal-300">
                  ✓ 交班时 {riskInfo.snapshotRiskCount} 项风险已全部解除
                </span>
              )}
            </div>
            <p className={`text-sm mt-1 ${
              (stillOpen || wasRiskButResolved) ? 'text-red-100' : 'text-gray-500'
            }`}>
              生成于 {formatDate(report.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:shadow transition-all ${
              (stillOpen || wasRiskButResolved) 
                ? 'hover:bg-white hover:bg-opacity-20 text-white' 
                : 'hover:bg-white text-gray-500 hover:text-gray-700'
            }`}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className={`rounded-xl p-6 mb-6 ${
            stillOpen 
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
              : wasRiskButResolved
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
          }`}>
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

          <div className={`grid gap-4 mb-6 ${riskInfo.hasAnyRisk ? 'grid-cols-5' : 'grid-cols-3'}`}>
            {riskInfo.hasAnyRisk && (
              <div className={`rounded-xl p-4 text-center border ${
                stillOpen 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-teal-50 border-teal-200'
              }`}>
                <div className={`text-3xl font-bold ${
                  stillOpen ? 'text-red-600' : 'text-teal-600'
                }`}>
                  {stillOpen ? riskInfo.stillOpenCount : 0}
                  <span className="text-sm font-normal text-gray-500 ml-1">/{riskInfo.snapshotRiskCount}</span>
                </div>
                <div className={`text-sm font-medium mt-1 ${
                  stillOpen ? 'text-red-600' : 'text-teal-600'
                }`}>
                  仍未解除 / 交班时风险
                </div>
              </div>
            )}
            {riskInfo.hasAnyRisk && (
              <div className={`rounded-xl p-4 text-center border ${
                riskInfo.pendingFeedbackCount > 0
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-indigo-50 border-indigo-200'
              }`}>
                <div className={`text-3xl font-bold ${
                  riskInfo.pendingFeedbackCount > 0 ? 'text-amber-600' : 'text-indigo-600'
                }`}>
                  {riskInfo.feedbackCount}
                  <span className="text-sm font-normal text-gray-500 ml-1">/{riskInfo.snapshotRiskCount}</span>
                </div>
                <div className={`text-sm font-medium mt-1 ${
                  riskInfo.pendingFeedbackCount > 0 ? 'text-amber-600' : 'text-indigo-600'
                }`}>
                  已反馈 / 风险总数
                </div>
              </div>
            )}
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

          {riskItemsWithLiveStatus.length > 0 && (
            <RiskItemSection
              title={stillOpen ? '⚠️ 交班时风险事项（仍有未解除）' : '✓ 交班时风险事项（已全部解除）'}
              items={riskItemsWithLiveStatus}
              color={stillOpen ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'}
              icon="⚠️"
            />
          )}

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
