import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface MonthlyData {
  name: string;
  income: number;
  expense: number;
}

interface ExpenseChartProps {
  data: MonthlyData[];
}

// Custom tooltip to format values as currency
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ₹${entry.value?.toFixed(2)}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export function ExpenseChart({ data }: ExpenseChartProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">Monthly Overview</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: isMobile ? 0 : 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar name="Income" dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar name="Expense" dataKey="expense" fill="#F97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
