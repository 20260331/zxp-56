import React from 'react';
import { HandoverItem, RiskStatus, RiskLevel } from '../types';
import { isToday, isOverdue } from '../utils/dateUtils';

interface StatsPanelProps {
  items: HandoverItem[];
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ items }) => {
  const total = items.length;
  const todayNew = items.filter(item => isToday(item.createdAt)).length;
  const overdue = items.filter(item => isOverdue(item.deadline, item.status)).length;
  const pending = items.filter(item => item.status === 'pending' || item.status === 'in_progress').length;
  const completed = items.filter(item => item.status === 'completed').length;
  const openRisks = items.filter(item => item.isRisk && item.riskStatus === RiskStatus.OPEN).length;
  const criticalRisks = items.filter(item => 
    item.isRisk && 
    item.riskStatus === RiskStatus.OPEN && 
    (item.riskLevel === RiskLevel.HIGH || item.riskLevel === RiskLevel.CRITICAL)
  ).length;

  const stats = [
    { label: '事项总数', value: total, color: 'bg-blue-500', bgColor: 'bg-blue-50', highlight: false },
    { label: '今日新增', value: todayNew, color: 'bg-green-500', bgColor: 'bg-green-50', highlight: false },
    { label: '已逾期', value: overdue, color: 'bg-red-500', bgColor: 'bg-red-50', highlight: overdue > 0 },
    { label: '待处理', value: pending, color: 'bg-yellow-500', bgColor: 'bg-yellow-50', highlight: false },
    { label: '已完成', value: completed, color: 'bg-teal-500', bgColor: 'bg-teal-50', highlight: false },
  ];

  return (
    <div className="space-y-4">
      {openRisks > 0 && (
        <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
          criticalRisks > 0 
            ? 'bg-red-50 border-red-400' 
            : 'bg-orange-50 border-orange-400'
        }`}>
          <div className={`text-4xl ${criticalRisks > 0 ? 'animate-pulse' : ''}`}>
            {criticalRisks > 0 ? '🚨' : '⚠️'}
          </div>
          <div className="flex-1">
            <div className={`font-bold text-lg ${
              criticalRisks > 0 ? 'text-red-700' : 'text-orange-700'
            }`}>
              当前有 {openRisks} 项未解除风险
              {criticalRisks > 0 && <span className="ml-2">（含 {criticalRisks} 项高/严重风险）</span>}
            </div>
            <div className={`text-sm ${
              criticalRisks > 0 ? 'text-red-600' : 'text-orange-600'
            }`}>
              请及时跟进处理，并在交班时重点说明
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-xl p-4 transition-transform hover:scale-105 ${
              stat.highlight ? 'ring-2 ring-red-300 animate-pulse' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
            </div>
            <div className={`text-3xl font-bold ${stat.color.replace('bg-', 'text-')}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
