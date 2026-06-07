import React, { useState, useEffect } from 'react';
import { HandoverItem, HandoverStatus, Priority, RiskLevel, RiskStatus } from '../types';
import { getTodayDate, toLocalISOString, fromLocalISOString } from '../utils/dateUtils';

interface ItemFormProps {
  item?: HandoverItem | null;
  onSubmit: (data: Omit<HandoverItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({ item, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: HandoverStatus.PENDING,
    priority: Priority.MEDIUM,
    assignee: '',
    reporter: '',
    deadline: `${getTodayDate()}T23:59`,
    remarks: '',
    isRisk: false,
    riskLevel: RiskLevel.NONE,
    riskStatus: RiskStatus.RESOLVED,
    followUpPlan: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority,
        assignee: item.assignee,
        reporter: item.reporter,
        deadline: fromLocalISOString(item.deadline),
        remarks: item.remarks || '',
        isRisk: item.isRisk,
        riskLevel: item.riskLevel,
        riskStatus: item.riskStatus,
        followUpPlan: item.followUpPlan || ''
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      deadline: toLocalISOString(formData.deadline)
    };
    if (!submitData.isRisk) {
      submitData.riskLevel = RiskLevel.NONE;
      submitData.riskStatus = RiskStatus.RESOLVED;
      submitData.followUpPlan = '';
    }
    onSubmit(submitData);
  };

  const handleRiskToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isRisk: checked,
      riskLevel: checked ? RiskLevel.MEDIUM : RiskLevel.NONE,
      riskStatus: checked ? RiskStatus.OPEN : RiskStatus.RESOLVED
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {item ? '编辑交接事项' : '新增交接事项'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              事项标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="请输入事项标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              详细描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="请输入详细描述"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <input
              type="checkbox"
              id="isRisk"
              checked={formData.isRisk}
              onChange={(e) => handleRiskToggle(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="isRisk" className="text-sm font-medium text-red-700 cursor-pointer">
              ⚠️ 标记为风险事项（需要交接班追踪）
            </label>
          </div>

          {formData.isRisk && (
            <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    风险等级 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  >
                    <option value={RiskLevel.LOW}>低</option>
                    <option value={RiskLevel.MEDIUM}>中</option>
                    <option value={RiskLevel.HIGH}>高</option>
                    <option value={RiskLevel.CRITICAL}>严重</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    风险状态
                  </label>
                  <select
                    value={formData.riskStatus}
                    onChange={(e) => setFormData({ ...formData, riskStatus: e.target.value as RiskStatus })}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  >
                    <option value={RiskStatus.OPEN}>未解除</option>
                    <option value={RiskStatus.RESOLVED}>已解除</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">
                  跟进计划 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required={formData.isRisk}
                  rows={3}
                  value={formData.followUpPlan}
                  onChange={(e) => setFormData({ ...formData, followUpPlan: e.target.value })}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  placeholder="请详细说明风险跟进计划、责任人、预计解除时间等..."
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as HandoverStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value={HandoverStatus.PENDING}>待处理</option>
                <option value={HandoverStatus.IN_PROGRESS}>处理中</option>
                <option value={HandoverStatus.COMPLETED}>已完成</option>
                <option value={HandoverStatus.CANCELLED}>已取消</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                优先级
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value={Priority.LOW}>低</option>
                <option value={Priority.MEDIUM}>中</option>
                <option value={Priority.HIGH}>高</option>
                <option value={Priority.URGENT}>紧急</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                责任人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="责任人姓名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                报告人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.reporter}
                onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="报告人姓名"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              截止时间 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注
            </label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="补充说明（可选）"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              {item ? '保存修改' : '创建事项'}
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
