import React, { useState, useMemo } from 'react';
import { HandoverItem, HandoverStatus, ShiftReportItem } from '../types';
import { getTodayDate, getCurrentShift, getShiftLabel, formatDate } from '../utils/dateUtils';
import { convertToReportItem } from '../utils/storage';

interface ShiftReportModalProps {
  items: HandoverItem[];
  onSubmit: (data: {
    date: string;
    shiftType: 'morning' | 'afternoon' | 'night';
    operator: string;
    handoverTime: string;
    nextOperator: string;
    summary: string;
    newItems: ShiftReportItem[];
    completedItems: ShiftReportItem[];
    pendingItems: ShiftReportItem[];
  }) => void;
  onCancel: () => void;
}

export const ShiftReportModal: React.FC<ShiftReportModalProps> = ({ items, onSubmit, onCancel }) => {
  const today = getTodayDate();
  const currentShift = getCurrentShift();
  
  const [formData, setFormData] = useState({
    date: today,
    shiftType: currentShift,
    operator: '',
    nextOperator: '',
    summary: ''
  });

  const { newItems, completedItems, pendingItems } = useMemo(() => {
    const todayItems = items.filter(item => {
      const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
      return itemDate === formData.date;
    });

    const news = todayItems
      .filter(item => item.status !== HandoverStatus.CANCELLED)
      .map(convertToReportItem);

    const completed = todayItems
      .filter(item => item.status === HandoverStatus.COMPLETED)
      .map(convertToReportItem);

    const pending = items
      .filter(item => 
        item.status === HandoverStatus.PENDING || 
        item.status === HandoverStatus.IN_PROGRESS
      )
      .map(convertToReportItem);

    return { newItems: news, completedItems: completed, pendingItems: pending };
  }, [items, formData.date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      handoverTime: new Date().toISOString(),
      newItems,
      completedItems,
      pendingItems
    });
  };

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

  const ItemList = ({ title, items, color, icon }: { 
    title: string; 
    items: ShiftReportItem[]; 
    color: string;
    icon: string;
  }) => (
    <div className="mb-4">
      <div className={`flex items-center gap-2 mb-2 p-2 rounded ${color}`}>
        <span>{icon}</span>
        <span className="font-semibold">{title}</span>
        <span className="ml-auto bg-white bg-opacity-50 px-2 py-0.5 rounded-full text-sm">
          {items.length} 项
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">暂无</p>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {items.map(item => (
            <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${priorityColors[item.priority]}`}>
                  {priorityLabels[item.priority]}
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>责任人: {item.assignee}</span>
                <span>截止: {formatDate(item.deadline)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            生成交接班报
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                交班日期
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                班次
              </label>
              <select
                value={formData.shiftType}
                onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as 'morning' | 'afternoon' | 'night' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="morning">{getShiftLabel('morning')}</option>
                <option value="afternoon">{getShiftLabel('afternoon')}</option>
                <option value="night">{getShiftLabel('night')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                交班人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="交班人姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                接班人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nextOperator}
                onChange={(e) => setFormData({ ...formData, nextOperator: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="接班人姓名"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-semibold text-gray-800 mb-4">当班摘要预览</h3>
            
            <ItemList 
              title="今日新增" 
              items={newItems} 
              color="bg-green-100 text-green-700" 
              icon="🆕"
            />
            
            <ItemList 
              title="今日完成" 
              items={completedItems} 
              color="bg-teal-100 text-teal-700" 
              icon="✅"
            />
            
            <ItemList 
              title="遗留待办" 
              items={pendingItems} 
              color="bg-yellow-100 text-yellow-700" 
              icon="⏳"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              交班小结 <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="请简要说明当班情况、重点事项、注意事项等..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              确认交班
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
