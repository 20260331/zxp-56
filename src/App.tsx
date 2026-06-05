import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsPanel } from './components/StatsPanel';
import { FilterBar } from './components/FilterBar';
import { ItemCard } from './components/ItemCard';
import { ItemForm } from './components/ItemForm';
import { ShiftReportModal } from './components/ShiftReportModal';
import { ShiftReportHistory } from './components/ShiftReportHistory';
import { ShiftReportDetail } from './components/ShiftReportDetail';
import { HandoverItem, FilterType, ShiftReport, ShiftReportItem } from './types';
import { getItems, addItem, updateItem, deleteItem, completeItem, getReports, addReport, deleteReport, confirmReport, ensureReportReceiptFields, getReportById } from './utils/storage';
import { isToday, isOverdue } from './utils/dateUtils';

function App() {
  const [items, setItems] = useState<HandoverItem[]>([]);
  const [reports, setReports] = useState<ShiftReport[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<HandoverItem | null>(null);
  const [showShiftReport, setShowShiftReport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingReport, setViewingReport] = useState<ShiftReport | null>(null);

  useEffect(() => {
    ensureReportReceiptFields();
    setItems(getItems());
    setReports(getReports());
  }, []);

  const refreshData = () => {
    setItems(getItems());
    setReports(getReports());
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleHandover = () => {
    setShowShiftReport(true);
  };

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  const handleReportSubmit = (data: {
    date: string;
    shiftType: 'morning' | 'afternoon' | 'night';
    operator: string;
    handoverTime: string;
    nextOperator: string;
    summary: string;
    newItems: ShiftReportItem[];
    completedItems: ShiftReportItem[];
    pendingItems: ShiftReportItem[];
  }) => {
    addReport(data);
    refreshData();
    setShowShiftReport(false);
    alert('交班报生成成功！');
  };

  const handleReportCancel = () => {
    setShowShiftReport(false);
  };

  const handleViewReportDetail = (report: ShiftReport) => {
    setViewingReport(report);
  };

  const handleCloseReportDetail = () => {
    setViewingReport(null);
  };

  const handleDeleteReport = (id: string) => {
    deleteReport(id);
    refreshData();
  };

  const handleConfirmReport = (id: string, receivedBy: string) => {
    confirmReport(id, receivedBy);
    refreshData();
    if (viewingReport && viewingReport.id === id) {
      setViewingReport(getReportById(id));
    }
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  const handleEditItem = (item: HandoverItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormSubmit = (data: Omit<HandoverItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
    } else {
      addItem(data);
    }
    refreshData();
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleComplete = (id: string) => {
    const remarks = window.prompt('请输入完成备注（可选）：');
    if (remarks === null) return;
    completeItem(id, remarks || undefined);
    refreshData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个交接事项吗？')) {
      deleteItem(id);
      refreshData();
    }
  };

  const filterItems = (items: HandoverItem[]): HandoverItem[] => {
    switch (currentFilter) {
      case 'today':
        return items.filter(item => isToday(item.createdAt));
      case 'overdue':
        return items.filter(item => isOverdue(item.deadline, item.status));
      case 'pending':
        return items.filter(item => item.status === 'pending' || item.status === 'in_progress');
      case 'completed':
        return items.filter(item => item.status === 'completed');
      default:
        return items;
    }
  };

  const filteredItems = filterItems(items);

  const counts = {
    all: items.length,
    today: items.filter(item => isToday(item.createdAt)).length,
    overdue: items.filter(item => isOverdue(item.deadline, item.status)).length,
    pending: items.filter(item => item.status === 'pending' || item.status === 'in_progress').length,
    completed: items.filter(item => item.status === 'completed').length,
  };

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aOverdue = isOverdue(a.deadline, a.status);
    const bOverdue = isOverdue(b.deadline, b.status);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAddItem={handleAddItem} 
        onHandover={handleHandover}
        onViewHistory={handleViewHistory}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="mb-8">
          <StatsPanel items={items} />
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">交接事项列表</h2>
          </div>
          <FilterBar
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            counts={counts}
          />
        </section>

        <section>
          {sortedItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">暂无交接事项</p>
              <p className="text-gray-400 text-sm mt-2">点击右上角"新增交接事项"按钮开始添加</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onComplete={handleComplete}
                  onEdit={handleEditItem}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {showForm && (
        <ItemForm
          item={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {showShiftReport && (
        <ShiftReportModal
          items={items}
          onSubmit={handleReportSubmit}
          onCancel={handleReportCancel}
        />
      )}

      {showHistory && (
        <ShiftReportHistory
          reports={reports}
          onViewDetail={handleViewReportDetail}
          onDelete={handleDeleteReport}
          onConfirm={handleConfirmReport}
          onClose={handleCloseHistory}
        />
      )}

      {viewingReport && (
        <ShiftReportDetail
          report={viewingReport}
          onConfirm={handleConfirmReport}
          onClose={handleCloseReportDetail}
        />
      )}
    </div>
  );
}

export default App;
