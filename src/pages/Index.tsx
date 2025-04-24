import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction, TransactionFormData } from '@/types/transaction';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { ExpenseChart } from '@/components/ExpenseChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const {
    transactions,
    isLoading,
    isInitialLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    editingTransaction,
    startEditing,
    cancelEditing,
    getMonthlyData
  } = useTransactions();
  
  const [activeTab, setActiveTab] = useState<string>('transactions');
  
  const handleSubmit = (data: TransactionFormData) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
    } else {
      addTransaction(data);
    }
  };
  
  // Calculate total income and expenses
  const totals = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'income') {
      acc.income += transaction.amount;
    } else {
      acc.expenses += transaction.amount;
    }
    return acc;
  }, { income: 0, expenses: 0 });
  
  const balance = totals.income - totals.expenses;
  
  // Render loading skeleton
  if (isInitialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Personal Finance Visualizer</h1>
          <p className="text-muted-foreground mt-2">Track, manage, and visualize your personal finances</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mb-8">
          <div className="bg-card p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-4">Monthly Overview</h3>
            <div className="h-[300px] w-full">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <Skeleton className="h-8 w-[200px] mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Personal Finance Visualizer</h1>
        <p className="text-muted-foreground mt-2">Track, manage, and visualize your personal finances</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">₹{totals.income.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">₹{totals.expenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <ExpenseChart data={getMonthlyData()} />
      </div>
      
      <Tabs defaultValue="transactions" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="add">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4">
          <TransactionList
            transactions={transactions}
            onEdit={(transaction) => {
              startEditing(transaction);
              setActiveTab('add');
            }}
            onDelete={deleteTransaction}
          />
        </TabsContent>
        
        <TabsContent value="add">
          <TransactionForm
            onSubmit={handleSubmit}
            transaction={editingTransaction}
            onCancel={editingTransaction ? () => {
              cancelEditing();
              setActiveTab('transactions');
            } : undefined}
            isSubmitting={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
