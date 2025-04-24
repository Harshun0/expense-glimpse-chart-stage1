
import React from 'react';
import { format } from 'date-fns';
import { Transaction } from '@/types/transaction';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const { id, amount, date, description, type } = transaction;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex flex-col mb-2 sm:mb-0">
        <div className="flex items-center gap-2">
          <div 
            className={cn(
              "w-3 h-3 rounded-full",
              type === 'income' ? 'bg-secondary' : 'bg-accent'
            )} 
          />
          <h3 className="font-medium">{description}</h3>
        </div>
        <span className="text-sm text-muted-foreground">{format(date, 'PPP')}</span>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
        <span 
          className={cn(
            "font-semibold mr-4",
            type === 'income' ? 'text-secondary' : 'text-accent'
          )}
        >
          {type === 'income' ? '+' : '-'} ${amount.toFixed(2)}
        </span>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(transaction)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
