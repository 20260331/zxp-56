import React from 'react';
import { HandoverItem, HandoverStatus, Priority } from '../types';
import { formatShortDate, isOverdue, isToday } from '../utils/dateUtils';

interface ItemCardProps {
  item: HandoverItem;
  onComplete: (id: string) => void;
  onEdit: (item: HandoverItem) => void;
  onDelete: (id: string) => void;
}

const statusLabels: Record<HandoverStatus, string> = {
  [HandoverStatus.PENDING]: '待处理',
  [HandoverStatus.IN_PROGRESS]: '处理中',
  [HandoverStatus.COMPLETED]: '已完成',
  [HandoverStatus.CANCELLED]: '已取消'
};

const priorityLabels: Record<Priority, string> = {
  [Priority.LOW]: '低',
  [Priority.MEDIUM]: '中',
  [Priority.HIGH]: '高',
  [Priority.URGENT]: '紧急'
};

const priorityColors: Record<Priority, string> = {
  [Priority.LOW]: 'bg-gray-100 text-gray-600',
  [Priority.MEDIUM]: 'bg-blue-100 text-blue-600',
  [Priority.HIGH]: 'bg-orange-100 text-orange-600',
  [Priority.URGENT]: 'bg-red-100 text-red-600'
};

const statusColors: Record<HandoverStatus, string> = {
  [HandoverStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
  [HandoverStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
  [HandoverStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [HandoverStatus.CANCELLED]: 'bg-gray-100 text-gray-600'
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, onComplete, onEdit, onDelete }) => {
  const overdue = isOverdue(item.deadline, item.status);
  const isNew = isToday(item.createdAt);
  const isCompleted = item.status === HandoverStatus.COMPLETED || item.status === HandoverStatus.CANCELLED;

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
      overdue ? 'border-red-400 bg-red-50' : 
      isNew ? 'border-green-400 bg-green-50' : 
      'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isNew && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-500 text-white rounded-full">
                今日新增
              </span>
            )}
            {overdue && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full animate-pulse">
                已逾期
              </span>
            )}
            <h3 className={`font-semibold text-gray-800 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {item.title}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[item.status]}`}>
          {statusLabels[item.status]}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[item.priority]}`}>
          优先级: {priorityLabels[item.priority]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
        <div>
          <span className="font-medium">责任人:</span> {item.assignee}
        </div>
        <div>
          <span className="font-medium">报告人:</span> {item.reporter}
        </div>
        <div>
          <span className="font-medium">截止时间:</span> {formatShortDate(item.deadline)}
        </div>
        <div>
          <span className="font-medium">创建时间:</span> {formatShortDate(item.createdAt)}
        </div>
      </div>

      {item.remarks && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <span className="font-medium">备注:</span> {item.remarks}
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        {!isCompleted && (
          <button
            onClick={() => onComplete(item.id)}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded transition-colors"
          >
            完成
          </button>
        )}
        <button
          onClick={() => onEdit(item)}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          编辑
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
        >
          删除
        </button>
      </div>
    </div>
  );
};
