import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../lib/auth';
import { Card, Table, Tabs, Button, Spin, Alert, Tag, Typography, Collapse, Divider, List, Space, Modal, Form, Input, Select, DatePicker } from 'antd';
import { FileText, FileBarChart, Calendar, Download, RefreshCw, ChevronRight, Clock, Bookmark, Info, Plus, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// COLORS for charts
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface Report {
  id: number;
  title: string;
  description: string;
  type: string;
  date_range: string;
  summary: string;
  created_at: string;
}

interface Policy {
  id: number;
  title: string;
  description: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Chart data types
interface ChartDataPoint {
  name: string;
  value: number;
}

interface BarChartDataPoint {
  name: string;
  [key: string]: string | number;
}

type ReportSection = {
  title: string;
  content: string;
  type: 'text' | 'chart' | 'table';
  chartType?: 'bar' | 'line' | 'pie';
  chartData?: {
    title?: string;
    yLabel?: string;
    data?: Array<ChartDataPoint | BarChartDataPoint>;
  };
  tableData?: {
    headers: string[];
    rows: string[][];
  };
};

// Chart preview component
const ChartPreview: React.FC<{ 
  type?: 'bar' | 'line' | 'pie'; 
  data: Array<ChartDataPoint | BarChartDataPoint>;
  title?: string;
  yLabel?: string;
}> = ({ type, data, title, yLabel }) => {
  if (!type || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-40 bg-gray-100 rounded">
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-60">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' && (
          <BarChart data={data as BarChartDataPoint[]} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: yLabel || '', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" name={title || 'Value'} />
          </BarChart>
        )}
        
        {type === 'line' && (
          <LineChart data={data as BarChartDataPoint[]} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: yLabel || '', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" name={title || 'Value'} />
          </LineChart>
        )}
        
        {type === 'pie' && (
          <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <>
              <Pie
                data={data as ChartDataPoint[]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </>
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// Table preview component
const TablePreview: React.FC<{
  headers: string[];
  rows: string[][];
}> = ({ headers, rows }) => {
  if (!headers || !rows || headers.length === 0 || rows.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-40 bg-gray-100 rounded">
        <p className="text-gray-500">No table data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {headers.map((header, index) => (
              <th key={index} className="border border-gray-300 px-4 py-2 text-left">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-gray-300 px-4 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReportingStrategy: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('reports');
  const { token } = useAuth();
  const [isReportModalVisible, setIsReportModalVisible] = useState<boolean>(false);
  const [reportSections, setReportSections] = useState<ReportSection[]>([]);
  const [newReportForm] = Form.useForm();
  const [creatingReport, setCreatingReport] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // Fetch reports
      const reportsResponse = await axios.get(`${apiUrl}/api/department-head/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch policies
      const policiesResponse = await axios.get(`${apiUrl}/api/department-head/policy`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (reportsResponse.data.status === 'success' && policiesResponse.data.status === 'success') {
        setReports(reportsResponse.data.data);
        setPolicies(policiesResponse.data.data);
      } else {
        setError('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading reports and policies..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={fetchData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const getReportTypeTag = (type: string) => {
    switch(type) {
      case 'enrollment':
        return <Tag color="blue">Enrollment</Tag>;
      case 'performance':
        return <Tag color="green">Performance</Tag>;
      case 'academic':
        return <Tag color="purple">Academic</Tag>;
      default:
        return <Tag color="default">{type}</Tag>;
    }
  };

  const reportColumns = [
    {
      title: 'Report Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getReportTypeTag(type)
    },
    {
      title: 'Date Range',
      dataIndex: 'date_range',
      key: 'date_range',
      render: (range: string) => (
        <span className="flex items-center">
          <Calendar className="mr-1 h-4 w-4 text-gray-500" /> {range}
        </span>
      )
    },
    {
      title: 'Summary',
      dataIndex: 'summary',
      key: 'summary',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button 
          icon={<Download className="h-4 w-4 mr-1" />}
          size="small"
        >
          Download
        </Button>
      )
    }
  ];

  const addReportSection = (type: 'text' | 'chart' | 'table') => {
    const newSection: ReportSection = {
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      content: '',
      type,
    };
    
    if (type === 'chart') {
      newSection.chartType = 'bar';
      newSection.chartData = {
        title: 'Sample Chart',
        yLabel: 'Values',
        data: [
          { name: 'Category A', value: 10 },
          { name: 'Category B', value: 20 },
          { name: 'Category C', value: 30 },
          { name: 'Category D', value: 15 },
          { name: 'Category E', value: 25 }
        ]
      };
    }
    
    if (type === 'table') {
      newSection.tableData = {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [
          ['Data 1', 'Data 2', 'Data 3'],
          ['Data 4', 'Data 5', 'Data 6']
        ]
      };
    }
    
    setReportSections([...reportSections, newSection]);
  };

  const updateReportSection = (index: number, data: Partial<ReportSection>) => {
    const updatedSections = [...reportSections];
    updatedSections[index] = { ...updatedSections[index], ...data };
    setReportSections(updatedSections);
  };

  const removeReportSection = (index: number) => {
    const updatedSections = [...reportSections];
    updatedSections.splice(index, 1);
    setReportSections(updatedSections);
  };

  const handleCreateReport = async () => {
    try {
      // Get form values
      const values = await newReportForm.validateFields();
      setCreatingReport(true);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // Format date range
      let dateRange = '';
      if (values.dateRange && values.dateRange.length === 2) {
        const startDate = values.dateRange[0].format('MMM YYYY');
        const endDate = values.dateRange[1].format('MMM YYYY');
        dateRange = `${startDate} - ${endDate}`;
      }
      
      // Compile report content
      const content = {
        sections: reportSections
      };
      
      const response = await axios.post(
        `${apiUrl}/api/department-head/reports`,
        {
          title: values.title,
          description: values.description,
          type: values.type,
          content: JSON.stringify(content),
          summary: values.summary,
          date_range: dateRange,
          department: 'Computer Science' // In a real app, get this from the user's profile
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.status === 'success') {
        // Add the new report to the state
        setReports([response.data.data, ...reports]);
        
        // Reset form and close modal
        setIsReportModalVisible(false);
        newReportForm.resetFields();
        setReportSections([]);
        
        // Show success notification
        Modal.success({
          title: 'Report Created',
          content: 'The report was successfully created and published.',
        });
      } else {
        setError(response.data.message || 'Failed to create report');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      setError('An error occurred while creating the report');
    } finally {
      setCreatingReport(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src="/assets/logo/logo.jpg" alt="Logo" className="h-10 w-auto mr-3 rounded" />
          <h1 className="text-2xl font-bold flex items-center">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            Reports & Strategy
          </h1>
        </div>
        <Space>
          <Button 
            onClick={fetchData} 
            icon={<RefreshCw size={16} className="mr-1" />}
          >
            Refresh Data
          </Button>
          {activeTab === 'reports' && (
            <Button 
              type="primary"
              icon={<Plus size={16} className="mr-1" />}
              onClick={() => setIsReportModalVisible(true)}
            >
              New Report
            </Button>
          )}
        </Space>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="mb-6"
      >
        <TabPane 
          tab={
            <span className="flex items-center">
              <FileBarChart className="mr-1 h-4 w-4" /> Department Reports
            </span>
          } 
          key="reports"
        >
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Title level={4}>Available Reports</Title>
            <Paragraph className="text-gray-500 mb-4">
              These reports provide insights into department performance, enrollment trends, and academic metrics.
            </Paragraph>
            <Table 
              dataSource={reports} 
              columns={reportColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>

          <div className="mt-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Title level={4}>Recent Report Insights</Title>
              <Paragraph className="text-gray-500 mb-4">
                Key findings from recent reports that may impact department strategy.
              </Paragraph>

              <List
                itemLayout="horizontal"
                dataSource={reports}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<FileBarChart className="h-8 w-8 p-1 bg-primary/10 text-primary rounded" />}
                      title={<span>{item.title}</span>}
                      description={
                        <div>
                          <p className="text-gray-500">{item.description}</p>
                          <p className="font-medium mt-1">{item.summary}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" /> 
                            {new Date(item.created_at).toLocaleDateString()}
                            <span className="mx-2">•</span>
                            {getReportTypeTag(item.type)}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center">
              <Bookmark className="mr-1 h-4 w-4" /> Department Policies
            </span>
          } 
          key="policies"
        >
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Title level={4}>Department Policies</Title>
            <Paragraph className="text-gray-500 mb-4">
              Official policies governing department operations, course management, and faculty responsibilities.
            </Paragraph>

            <Collapse 
              bordered={false} 
              className="bg-transparent"
            >
              {policies.map(policy => (
                <Panel
                  key={policy.id}
                  header={
                    <div className="flex items-center">
                      <Info className="h-5 w-5 mr-2 text-primary" />
                      <span className="font-medium">{policy.title}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        Last updated: {new Date(policy.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  }
                  className="mb-4 border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="p-2">
                    <div className="mb-3">
                      <Text strong>Description:</Text>
                      <Paragraph>{policy.description}</Paragraph>
                    </div>
                    
                    <Divider className="my-3" />
                    
                    <div>
                      <Text strong>Policy Details:</Text>
                      <Paragraph className="whitespace-pre-wrap mt-2">{policy.content}</Paragraph>
                    </div>
                  </div>
                </Panel>
              ))}
            </Collapse>
          </Card>

          <div className="mt-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Title level={4}>Strategic Planning</Title>
              <Paragraph className="text-gray-500 mb-4">
                Department's strategic goals and implementation plans.
              </Paragraph>

              <List
                itemLayout="horizontal"
                dataSource={[
                  {
                    title: "2025 Academic Year Planning",
                    description: "Course offerings, faculty assignments, and resource allocation for the upcoming academic year.",
                    status: "In Progress",
                    dueDate: "May 15, 2025"
                  },
                  {
                    title: "Curriculum Review",
                    description: "Comprehensive review of department curriculum to ensure alignment with industry needs and academic standards.",
                    status: "Planned",
                    dueDate: "August 30, 2025"
                  },
                  {
                    title: "Faculty Development Initiative",
                    description: "Program to enhance faculty skills in teaching methodologies and research capabilities.",
                    status: "Approved",
                    dueDate: "Ongoing"
                  }
                ]}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button type="link" className="flex items-center">
                        View Details <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={<span>{item.title}</span>}
                      description={
                        <div>
                          <p>{item.description}</p>
                          <Space className="mt-2">
                            <Tag color={item.status === "In Progress" ? "blue" : item.status === "Approved" ? "green" : "orange"}>
                              {item.status}
                            </Tag>
                            <span className="text-xs text-gray-500">Due: {item.dueDate}</span>
                          </Space>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </TabPane>
      </Tabs>

      <Modal
        title="Create New Report"
        open={isReportModalVisible}
        onCancel={() => {
          setIsReportModalVisible(false);
          setReportSections([]);
          newReportForm.resetFields();
        }}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={newReportForm}
          layout="vertical"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Report Title"
              name="title"
              rules={[{ required: true, message: 'Please enter a report title' }]}
            >
              <Input placeholder="e.g., Quarterly Enrollment Analysis" />
            </Form.Item>
            
            <Form.Item
              label="Report Type"
              name="type"
              rules={[{ required: true, message: 'Please select a report type' }]}
            >
              <Select placeholder="Select report type">
                <Option value="enrollment">Enrollment</Option>
                <Option value="performance">Performance</Option>
                <Option value="academic">Academic</Option>
                <Option value="financial">Financial</Option>
                <Option value="resources">Resources</Option>
                <Option value="custom">Custom</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input placeholder="Brief description of this report" />
          </Form.Item>
          
          <Form.Item
            label="Date Range"
            name="dateRange"
          >
            <RangePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            label="Executive Summary"
            name="summary"
            rules={[{ required: true, message: 'Please provide an executive summary' }]}
          >
            <TextArea 
              rows={3}
              placeholder="A brief summary of the key findings and implications..." 
            />
          </Form.Item>
          
          <Divider orientation="left">Report Content Builder</Divider>
          
          <div className="flex justify-center mb-4 space-x-2">
            <Button onClick={() => addReportSection('text')} icon={<FileText size={16} className="mr-1" />}>
              Add Text
            </Button>
            <Button onClick={() => addReportSection('chart')} icon={<BarChart3 size={16} className="mr-1" />}>
              Add Chart
            </Button>
            <Button onClick={() => addReportSection('table')} icon={<Table size={16} className="mr-1" />}>
              Add Table
            </Button>
          </div>
          
          {reportSections.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-md bg-gray-50">
              <p className="text-gray-500">Add content sections to your report using the buttons above.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {reportSections.map((section, index) => (
                <Card 
                  key={index} 
                  title={
                    <Input 
                      value={section.title} 
                      onChange={(e) => updateReportSection(index, { title: e.target.value })}
                      placeholder="Section Title"
                    />
                  }
                  extra={
                    <Button 
                      danger 
                      size="small" 
                      onClick={() => removeReportSection(index)}
                    >
                      Remove
                    </Button>
                  }
                  className="shadow-sm"
                >
                  {section.type === 'text' && (
                    <TextArea 
                      rows={4}
                      value={section.content}
                      onChange={(e) => updateReportSection(index, { content: e.target.value })}
                      placeholder="Enter content text here..."
                    />
                  )}
                  
                  {section.type === 'chart' && (
                    <div>
                      <div className="mb-2">
                        <Select 
                          value={section.chartType} 
                          onChange={(value) => updateReportSection(index, { chartType: value })}
                          style={{ width: '100%' }}
                        >
                          <Option value="bar">Bar Chart</Option>
                          <Option value="line">Line Chart</Option>
                          <Option value="pie">Pie Chart</Option>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 my-2">
                        <div>
                          <div className="text-sm font-medium mb-1">Chart Title</div>
                          <Input 
                            placeholder="Chart Title" 
                            value={section.chartData?.title || ''} 
                            onChange={(e) => {
                              const newChartData = { ...section.chartData, title: e.target.value };
                              updateReportSection(index, { chartData: newChartData });
                            }}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">Y-Axis Label</div>
                          <Input 
                            placeholder="Y-Axis Label" 
                            value={section.chartData?.yLabel || ''} 
                            onChange={(e) => {
                              const newChartData = { ...section.chartData, yLabel: e.target.value };
                              updateReportSection(index, { chartData: newChartData });
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Chart Data Editor */}
                      <div className="mt-4 border rounded-md p-3 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-medium">Chart Data Points</div>
                          <Button 
                            size="small"
                            onClick={() => {
                              const currentData = section.chartData?.data || [];
                              const newData = [...currentData, { name: `Category ${currentData.length + 1}`, value: 10 }];
                              const newChartData = { ...section.chartData, data: newData };
                              updateReportSection(index, { chartData: newChartData });
                            }}
                          >
                            Add Data Point
                          </Button>
                        </div>
                        
                        {section.chartData?.data && section.chartData.data.length > 0 ? (
                          <div className="space-y-2">
                            {section.chartData.data.map((point, pointIndex) => (
                              <div key={pointIndex} className="flex items-center space-x-2">
                                <Input 
                                  placeholder="Category Name"
                                  value={point.name} 
                                  onChange={(e) => {
                                    const newData = [...(section.chartData?.data || [])];
                                    newData[pointIndex] = { ...newData[pointIndex], name: e.target.value };
                                    const newChartData = { ...section.chartData, data: newData };
                                    updateReportSection(index, { chartData: newChartData });
                                  }}
                                  style={{ width: '50%' }}
                                />
                                <Input 
                                  type="number"
                                  placeholder="Value"
                                  value={point.value} 
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    const newData = [...(section.chartData?.data || [])];
                                    newData[pointIndex] = { ...newData[pointIndex], value };
                                    const newChartData = { ...section.chartData, data: newData };
                                    updateReportSection(index, { chartData: newChartData });
                                  }}
                                  style={{ width: '30%' }}
                                />
                                <Button 
                                  danger
                                  size="small"
                                  onClick={() => {
                                    const newData = [...(section.chartData?.data || [])];
                                    newData.splice(pointIndex, 1);
                                    const newChartData = { ...section.chartData, data: newData };
                                    updateReportSection(index, { chartData: newChartData });
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-2 text-gray-500">
                            No data points added yet. Click "Add Data Point" to start.
                          </div>
                        )}
                      </div>
                      
                      <div className="border p-4 rounded-md bg-gray-50 mt-4">
                        {section.chartData?.data && section.chartData.data.length > 0 ? (
                          <ChartPreview 
                            type={section.chartType} 
                            data={section.chartData.data} 
                            title={section.chartData.title} 
                            yLabel={section.chartData.yLabel} 
                          />
                        ) : (
                          <div className="text-center p-4 border border-dashed rounded-md">
                            {section.chartType === 'bar' && <BarChart3 className="h-16 w-16 mx-auto text-gray-400" />}
                            {section.chartType === 'line' && <LineChartIcon className="h-16 w-16 mx-auto text-gray-400" />}
                            {section.chartType === 'pie' && <PieChartIcon className="h-16 w-16 mx-auto text-gray-400" />}
                            <p className="text-gray-500 mt-2">Chart Preview</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {section.type === 'table' && (
                    <div>
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1">Table Headers</div>
                        <Input 
                          placeholder="Column 1, Column 2, Column 3" 
                          value={(section.tableData?.headers || []).join(', ')}
                          onChange={(e) => {
                            const headers = e.target.value.split(',').map(h => h.trim());
                            const newTableData = { 
                              headers,
                              rows: section.tableData?.rows || []
                            };
                            updateReportSection(index, { tableData: newTableData });
                          }}
                        />
                      </div>
                      
                      <div className="mb-2">
                        <div className="text-sm font-medium mb-1">Table Data</div>
                        <TextArea 
                          rows={4}
                          placeholder="Enter comma-separated values for each row. Use new lines for new rows."
                          value={(section.tableData?.rows || []).map((row) => row.join(', ')).join('\n')}
                          onChange={(e) => {
                            const rows = e.target.value.split('\n').map(
                              line => line.split(',').map(cell => cell.trim())
                            );
                            const newTableData = { 
                              headers: section.tableData?.headers || ['Column 1', 'Column 2', 'Column 3'],
                              rows
                            };
                            updateReportSection(index, { tableData: newTableData });
                          }}
                        />
                      </div>
                      
                      <div className="border p-4 rounded-md bg-gray-50">
                        {section.tableData?.headers && section.tableData.rows && section.tableData.rows.length > 0 ? (
                          <TablePreview 
                            headers={section.tableData.headers} 
                            rows={section.tableData.rows} 
                          />
                        ) : (
                          <div className="text-center">
                            <p className="text-gray-500">Table Preview</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Enter headers and data to see a preview of your table.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <Space>
              <Button 
                onClick={() => {
                  setIsReportModalVisible(false);
                  setReportSections([]);
                  newReportForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary"
                onClick={handleCreateReport}
                loading={creatingReport}
                disabled={reportSections.length === 0}
              >
                Create Report
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportingStrategy; 