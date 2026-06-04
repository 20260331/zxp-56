import React from 'react';
import { FilterType } from '../types';

interface FilterBarProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    today: number;
    overdue: number;
    pending: number;
    completed: number;
  };
}

const filterLabels: Record<FilterType, string> = {
  all: '全部',
  today: '今日新增',
  overdue: '已逾期',
  pending: '待处理',
  completed: '已完成'
};

const filterColors: Record<FilterType, string> = {
  all: 'bg-gray-500',
  today: 'bg-green-500',
  overdue: 'bg-red-500',
  pending: 'bg-yellow-500',
  completed: 'bg-blue-500'
};

export const FilterBar: React.FC<FilterBarProps> = ({ currentFilter, onFilterChange, counts }) => {
  const filters: FilterType[] = ['all', 'today', 'overdue', 'pending', 'completed'];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            currentFilter === filter
              ? `${filterColors[filter]} text-white shadow-md`
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {filterLabels[filter]}
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            currentFilter === filter ? 'bg-white bg-opacity-30' : 'bg-gray-200'
          }`}>
            {counts[filter]}
          </span>
        </button>
      ))}
    </div>
  );
};
