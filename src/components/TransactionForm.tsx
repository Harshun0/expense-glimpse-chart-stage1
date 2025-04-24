
import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Transaction, TransactionFormData } from '@/types/transaction';

const transactionFormSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  date: z.date({
    required_error: "Date is required",
  }),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['income', 'expense'], {
    required_error: "Type is required",
  }),
});

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  transaction?: Transaction | null;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function TransactionForm({ onSubmit, transaction = null, onCancel, isSubmitting = false }: TransactionFormProps) {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: transaction?.amount || 0,
      date: transaction?.date || new Date(),
      description: transaction?.description || '',
      type: transaction?.type || 'expense',
    },
  });

  useEffect(() => {
    if (transaction) {
      form.reset({
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
        type: transaction.type,
      });
    }
  }, [transaction, form]);

  const handleSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    if (!transaction) {
      form.reset({
        amount: 0,
        date: new Date(),
        description: '',
        type: 'expense',
      });
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">
        {transaction ? 'Edit Transaction' : 'Add New Transaction'}
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter transaction description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={transaction ? 'bg-secondary' : 'bg-primary'}
            >
              {isSubmitting ? "Processing..." : transaction ? "Update Transaction" : "Add Transaction"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
