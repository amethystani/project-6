import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useTheme } from './ThemeProvider';

// Sample data for department enrollment
const enrollmentData = [
  { month: 'Jan', students: 150 },
  { month: 'Feb', students: 170 },
  { month: 'Mar', students: 180 },
  { month: 'Apr', students: 190 },
  { month: 'May', students: 210 },
  { month: 'Jun', students: 230 },
  { month: 'Jul', students: 190 },
  { month: 'Aug', students: 240 },
  { month: 'Sep', students: 280 },
  { month: 'Oct', students: 260 },
  { month: 'Nov', students: 255 },
  { month: 'Dec', students: 230 },
];

// Sample data for performance metrics
const performanceData = [
  { name: 'CS101', pass: 85, fail: 15 },
  { name: 'CS202', pass: 78, fail: 22 },
  { name: 'CS303', pass: 92, fail: 8 },
  { name: 'CS404', pass: 80, fail: 20 },
  { name: 'CS505', pass: 65, fail: 35 },
];

// Sample data for departmental budget allocation
const budgetData = [
  { name: 'Teaching Staff', value: 45 },
  { name: 'Research', value: 25 },
  { name: 'Equipment', value: 15 },
  { name: 'Administrative', value: 10 },
  { name: 'Facilities', value: 5 },
];

// Sample data for faculty workload
const facultyWorkloadData = [
  {
    name: 'Dr. Smith',
    teaching: 15,
    research: 35,
    admin: 20,
    mentoring: 30,
  },
  {
    name: 'Dr. Johnson',
    teaching: 25,
    research: 25,
    admin: 30,
    mentoring: 20,
  },
  {
    name: 'Dr. Williams',
    teaching: 35,
    research: 20,
    admin: 25,
    mentoring: 20,
  },
  {
    name: 'Dr. Brown',
    teaching: 20,
    research: 40,
    admin: 15,
    mentoring: 25,
  },
  {
    name: 'Dr. Jones',
    teaching: 30,
    research: 30,
    admin: 20,
    mentoring: 20,
  },
];

// COLORS for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border border-border rounded-md shadow-md">
        <p className="text-sm font-medium">{`${label}`}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: item.color }}>
            {`${item.name}: ${item.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

type ChartType = 'enrollment' | 'performance' | 'budget' | 'workload';

interface ChartsComponentProps {
  defaultChart?: ChartType;
}

export const ChartsComponent: React.FC<ChartsComponentProps> = ({ defaultChart = 'enrollment' }) => {
  const [activeChart, setActiveChart] = useState<ChartType>(defaultChart);
  const { theme } = useTheme();
  
  // Get colors based on theme
  const axisColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  return (
    <div className="bg-background p-4 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Department Analytics</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveChart('enrollment')}
            className={`px-3 py-1 text-sm rounded-md transition-all ${
              activeChart === 'enrollment' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-primary/10 hover:bg-primary/20'
            }`}
          >
            Enrollment
          </button>
          <button 
            onClick={() => setActiveChart('performance')}
            className={`px-3 py-1 text-sm rounded-md transition-all ${
              activeChart === 'performance' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-primary/10 hover:bg-primary/20'
            }`}
          >
            Performance
          </button>
          <button 
            onClick={() => setActiveChart('budget')}
            className={`px-3 py-1 text-sm rounded-md transition-all ${
              activeChart === 'budget' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-primary/10 hover:bg-primary/20'
            }`}
          >
            Budget
          </button>
          <button 
            onClick={() => setActiveChart('workload')}
            className={`px-3 py-1 text-sm rounded-md transition-all ${
              activeChart === 'workload' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-primary/10 hover:bg-primary/20'
            }`}
          >
            Workload
          </button>
        </div>
      </div>
      
      <div className="h-80 w-full">
        {activeChart === 'enrollment' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={enrollmentData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: axisColor }} />
              <YAxis tick={{ fill: axisColor }} />
              <Tooltip content={<ChartTooltip />} />
              <Area 
                type="monotone" 
                dataKey="students" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#enrollmentGradient)" 
                activeDot={{ r: 8 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        
        {activeChart === 'performance' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: axisColor }} />
              <YAxis tick={{ fill: axisColor }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="pass" stackId="a" fill="#4ade80" />
              <Bar dataKey="fail" stackId="a" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {activeChart === 'budget' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {activeChart === 'workload' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={facultyWorkloadData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" tick={{ fill: axisColor }} />
              <YAxis dataKey="name" type="category" tick={{ fill: axisColor }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="teaching" stackId="a" fill="#8884d8" />
              <Bar dataKey="research" stackId="a" fill="#82ca9d" />
              <Bar dataKey="admin" stackId="a" fill="#ffc658" />
              <Bar dataKey="mentoring" stackId="a" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ChartsComponent; 