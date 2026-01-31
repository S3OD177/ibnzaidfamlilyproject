"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface GenderDistributionChartProps {
  data: { name: string; value: number; fill: string }[];
}

export default function GenderDistributionChart({ data }: GenderDistributionChartProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-[#dbe6e0] shadow-sm">
      <h3 className="text-lg font-bold text-[#111814] mb-4">توزيع الجنس</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #dbe6e0',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-sm font-medium text-gray-700">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div className="size-4 rounded" style={{ backgroundColor: item.fill }}></div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{item.name}</p>
              <p className="text-lg font-bold text-[#111814]">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
