import React from 'react';
import { HandoverItem } from '../types';
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

  const stats = [
    { label: '事项总数', value: total, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
    { label: '今日新增', value: todayNew, color: 'bg-green-500', bgColor: 'bg-green-50' },
    { label: '已逾期', value: overdue, color: 'bg-red-500', bgColor: 'bg-red-50' },
    { label: '待处理', value: pending, color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
    { label: '已完成', value: completed, color: 'bg-teal-500', bgColor: 'bg-teal-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bgColor} rounded-xl p-4 transition-transform hover:scale-105`}
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
  );
};
