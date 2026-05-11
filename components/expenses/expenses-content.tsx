'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { Plus, Search, ScanLine, Wallet, ArrowUpRight, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';
import type { Expense, ExpenseCategory, Currency } from '@/types';

const CHART_COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#f97316', '#ec4899'];

interface ExpensesContentProps {
  expenses: (Expense & { category: ExpenseCategory | null })[];
  categories: ExpenseCategory[];
  currency: Currency;
}

export function ExpensesContent({ expenses, categories, currency }: ExpensesContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.merchant?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory = selectedCategory === 'all' || e.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount), 0), [expenses]);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; color: string; icon: string }>();
    expenses.forEach((e) => {
      const cat = e.category;
      if (!cat) return;
      const existing = map.get(cat.id) ?? { name: cat.name, amount: 0, color: cat.color, icon: cat.icon };
      map.set(cat.id, { ...existing, amount: existing.amount + Number(e.amount) });
    });
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const pieData = categoryTotals.slice(0, 8).map((c, i) => ({
    name: c.name,
    value: c.amount,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">{format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/expenses/new?mode=scan"
            className="flex items-center gap-2 border border-border hover:border-teal-500/50 text-foreground text-sm font-medium px-3.5 py-2.5 rounded-xl transition-all hover:bg-muted"
          >
            <ScanLine className="w-4 h-4 text-teal-500" />
            Scan receipt
          </Link>
          <Link
            href="/expenses/new"
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add expense
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="aethlife-card col-span-2">
          <p className="text-xs text-muted-foreground mb-1">Total this month</p>
          <p className="text-2xl font-bold font-sans text-foreground">{formatCurrency(totalSpent, currency)}</p>
          <p className="text-xs text-muted-foreground mt-1">{expenses.length} transactions</p>
        </div>
        {categoryTotals.slice(0, 2).map((cat) => (
          <div key={cat.name} className="aethlife-card">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{cat.icon}</span>
              <p className="text-xs text-muted-foreground truncate">{cat.name}</p>
            </div>
            <p className="text-lg font-bold font-sans text-foreground">{formatCurrency(cat.amount, currency)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {Math.round((cat.amount / totalSpent) * 100)}% of total
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {pieData.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="aethlife-card">
            <p className="text-sm font-semibold text-foreground mb-4">By Category</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, currency)}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="aethlife-card">
            <p className="text-sm font-semibold text-foreground mb-4">Top Categories</p>
            <div className="space-y-2.5">
              {categoryTotals.slice(0, 5).map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-sm">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-foreground truncate">{cat.name}</p>
                      <p className="text-xs font-medium text-foreground ml-2">{formatCurrency(cat.amount, currency)}</p>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((cat.amount / totalSpent) * 100)}%`,
                          backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              selectedCategory === 'all' ? 'bg-teal-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5 ${
                selectedCategory === cat.id ? 'bg-teal-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Expense list */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">{filtered.length} transactions</p>
        {filtered.length === 0 ? (
          <div className="aethlife-card text-center py-12">
            <Wallet className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No expenses found</p>
            <p className="text-xs text-muted-foreground mb-4">
              {searchQuery ? 'Try a different search term' : 'Start logging your expenses'}
            </p>
            {!searchQuery && (
              <Link
                href="/expenses/new"
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add first expense
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((expense) => (
              <div key={expense.id} className="aethlife-card flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-lg flex-shrink-0">
                  {expense.category?.icon ?? '💰'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{expense.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {expense.merchant && `${expense.merchant} · `}
                    {format(parseISO(expense.date), 'MMM d, yyyy')}
                    {expense.category && ` · ${expense.category.name}`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(Number(expense.amount), expense.currency as Currency)}
                  </p>
                  {expense.ai_scanned && (
                    <span className="text-[10px] text-teal-500 flex items-center gap-0.5 justify-end mt-0.5">
                      <ScanLine className="w-2.5 h-2.5" />
                      AI scanned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
