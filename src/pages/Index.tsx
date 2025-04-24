
import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction, TransactionFormData } from '@/types/transaction';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { ExpenseChart } from '@/components/ExpenseChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const {
    transactions,
    isLoading,
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
            <div className="text-2xl font-bold text-secondary">${totals.income.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">${totals.expenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ${balance.toFixed(2)}
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
