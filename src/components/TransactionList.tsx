
import React, { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { TransactionItem } from '@/components/TransactionItem';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      // Apply type filter
      if (filter !== 'all' && transaction.type !== filter) {
        return false;
      }
      
      // Apply search filter
      if (search && !transaction.description.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'date') {
        return sortDirection === 'asc' 
          ? a.date.getTime() - b.date.getTime()
          : b.date.getTime() - a.date.getTime();
      } else {
        return sortDirection === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filter">Filter by</Label>
            <Select
              value={filter}
              onValueChange={(value: 'all' | 'income' | 'expense') => setFilter(value)}
            >
              <SelectTrigger id="filter">
                <SelectValue placeholder="Filter transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="income">Income Only</SelectItem>
                <SelectItem value="expense">Expenses Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sort">Sort by</Label>
            <Select
              value={sortBy}
              onValueChange={(value: 'date' | 'amount') => setSortBy(value)}
            >
              <SelectTrigger id="sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="direction">Order</Label>
            <Select
              value={sortDirection}
              onValueChange={(value: 'asc' | 'desc') => setSortDirection(value)}
            >
              <SelectTrigger id="direction">
                <SelectValue placeholder="Sort direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Transactions</h3>
          <p className="text-sm text-muted-foreground">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
          </p>
        </div>
        
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {filteredTransactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new transaction</p>
          </div>
        )}
      </div>
    </div>
  );
}
