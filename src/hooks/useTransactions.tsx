import { useState, useEffect } from 'react';
import { Transaction, TransactionFormData } from '@/types/transaction';
import { useToast } from '@/components/ui/use-toast';
import { TransactionAPI } from '@/lib/api';

export function useTransactions() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Fetch transactions on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await TransactionAPI.getAll();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchTransactions();
  }, [toast]);

  const addTransaction = async (transactionData: TransactionFormData) => {
    setIsLoading(true);
    try {
      const newTransaction = await TransactionAPI.add(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (id: string, transactionData: TransactionFormData) => {
    setIsLoading(true);
    try {
      const updatedTransaction = await TransactionAPI.update(id, transactionData);
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id 
            ? updatedTransaction 
            : transaction
        )
      );
      setEditingTransaction(null);
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    setIsLoading(true);
    try {
      await TransactionAPI.delete(id);
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const cancelEditing = () => {
    setEditingTransaction(null);
  };

  const getMonthlyData = () => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    // Initialize data structure to hold monthly totals
    const monthlyData = months.map(month => ({
      name: month,
      income: 0,
      expense: 0
    }));
    
    // Aggregate transactions by month
    transactions.forEach(transaction => {
      const month = transaction.date.getMonth();
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expense += transaction.amount;
      }
    });
    
    return monthlyData;
  };

  return {
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
  };
}
