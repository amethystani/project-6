import React, { useState } from 'react';
import { 
  Database, 
  Server, 
  HardDrive, 
  Cpu, 
  BarChart3, 
  PieChart,
  Clock,
  Calendar,
  Users,
  Building,
  Laptop,
  Printer,
  Wifi,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

// Define types for resources
interface Resource {
  id: string;
  name: string;
  type: 'server' | 'storage' | 'network' | 'classroom' | 'lab' | 'software' | 'hardware';
  status: 'available' | 'in-use' | 'maintenance' | 'reserved';
  capacity: number;
  utilization: number;
  location?: string;
  assignedTo?: string;
  lastUpdated: string;
}

// Mock data for resources
const resourcesData: Resource[] = [
  {
    id: 'res-001',
    name: 'Main Database Server',
    type: 'server',
    status: 'in-use',
    capacity: 100,
    utilization: 68,
    location: 'Data Center A',
    lastUpdated: '2024-03-06T10:30:00'
  },
  {
    id: 'res-002',
    name: 'Storage Array 1',
    type: 'storage',
    status: 'in-use',
    capacity: 20000,
    utilization: 45,
    location: 'Data Center A',
    lastUpdated: '2024-03-06T09:15:00'
  },
  {
    id: 'res-003',
    name: 'Web Application Server',
    type: 'server',
    status: 'in-use',
    capacity: 100,
    utilization: 82,
    location: 'Data Center B',
    lastUpdated: '2024-03-06T11:45:00'
  },
  {
    id: 'res-004',
    name: 'Backup Storage',
    type: 'storage',
    status: 'available',
    capacity: 50000,
    utilization: 30,
    location: 'Data Center B',
    lastUpdated: '2024-03-05T16:20:00'
  },
  {
    id: 'res-005',
    name: 'Core Network Switch',
    type: 'network',
    status: 'in-use',
    capacity: 10000,
    utilization: 55,
    location: 'Network Room',
    lastUpdated: '2024-03-06T08:30:00'
  },
  {
    id: 'res-006',
    name: 'Computer Lab 101',
    type: 'lab',
    status: 'in-use',
    capacity: 30,
    utilization: 90,
    location: 'Building A, Floor 1',
    assignedTo: 'CS Department',
    lastUpdated: '2024-03-06T09:00:00'
  },
  {
    id: 'res-007',
    name: 'Lecture Hall 305',
    type: 'classroom',
    status: 'reserved',
    capacity: 120,
    utilization: 0,
    location: 'Building B, Floor 3',
    assignedTo: 'Mathematics Department',
    lastUpdated: '2024-03-06T10:15:00'
  },
  {
    id: 'res-008',
    name: 'MATLAB License Pack',
    type: 'software',
    status: 'in-use',
    capacity: 50,
    utilization: 42,
    assignedTo: 'Engineering Department',
    lastUpdated: '2024-03-05T14:30:00'
  },
  {
    id: 'res-009',
    name: 'Research Workstations',
    type: 'hardware',
    status: 'in-use',
    capacity: 15,
    utilization: 80,
    location: 'Research Lab',
    assignedTo: 'Physics Department',
    lastUpdated: '2024-03-06T11:00:00'
  },
  {
    id: 'res-010',
    name: 'Wireless Access Points',
    type: 'network',
    status: 'maintenance',
    capacity: 200,
    utilization: 0,
    location: 'Campus-wide',
    lastUpdated: '2024-03-04T09:45:00'
  },
];

// Custom Flask icon component
const Flask = ({ className }: { className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M9 3h6v3H9z"></path>
      <path d="M10 6v14a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V6"></path>
      <path d="M8.5 12.5L5 16"></path>
      <path d="M15.5 12.5L19 16"></path>
      <path d="M8 16h8"></path>
    </svg>
  );
};

export default function ResourceAllocation() {
  const [resources] = useState<Resource[]>(resourcesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter resources based on search and filters
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getResourceTypeIcon = (type: string) => {
    switch(type) {
      case 'server':
        return <Server className="h-5 w-5 text-blue-500" />;
      case 'storage':
        return <HardDrive className="h-5 w-5 text-purple-500" />;
      case 'network':
        return <Wifi className="h-5 w-5 text-green-500" />;
      case 'classroom':
        return <Building className="h-5 w-5 text-yellow-500" />;
      case 'lab':
        return <Flask className="h-5 w-5 text-red-500" />;
      case 'software':
        return <Cpu className="h-5 w-5 text-indigo-500" />;
      case 'hardware':
        return <Laptop className="h-5 w-5 text-orange-500" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available':
        return 'bg-green-500/10 text-green-500';
      case 'in-use':
        return 'bg-blue-500/10 text-blue-500';
      case 'maintenance':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'reserved':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Resource Allocation & Management</h1>
        
        <button 
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center border rounded-md py-1 px-3">
            <span className="mr-2">Type:</span>
            <select 
              className="bg-transparent border-none outline-none" 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="server">Servers</option>
              <option value="storage">Storage</option>
              <option value="network">Network</option>
              <option value="classroom">Classrooms</option>
              <option value="lab">Labs</option>
              <option value="software">Software</option>
              <option value="hardware">Hardware</option>
            </select>
          </div>
          
          <div className="flex items-center border rounded-md py-1 px-3">
            <span className="mr-2">Status:</span>
            <select 
              className="bg-transparent border-none outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="in-use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search resources..."
              className="border rounded-md pl-9 pr-3 py-2 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Server className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Servers</p>
              <p className="text-2xl font-bold">
                {resources.filter(r => r.type === 'server').length}
              </p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ 
                width: `${Math.round(
                  (resources.filter(r => r.type === 'server' && r.status === 'in-use').length / 
                  Math.max(1, resources.filter(r => r.type === 'server').length)) * 100
                )}%` 
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {resources.filter(r => r.type === 'server' && r.status === 'in-use').length} in use
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <HardDrive className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Storage Capacity</p>
              <p className="text-2xl font-bold">
                {Math.round(resources
                  .filter(r => r.type === 'storage')
                  .reduce((acc, curr) => acc + curr.capacity, 0) / 1000)} TB
              </p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-purple-500 rounded-full" 
              style={{ 
                width: `${Math.round(
                  (resources
                    .filter(r => r.type === 'storage')
                    .reduce((acc, curr) => acc + (curr.capacity * curr.utilization / 100), 0) /
                  Math.max(1, resources
                    .filter(r => r.type === 'storage')
                    .reduce((acc, curr) => acc + curr.capacity, 0))) * 100
                )}%` 
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {Math.round(resources
              .filter(r => r.type === 'storage')
              .reduce((acc, curr) => acc + (curr.capacity * curr.utilization / 100), 0) / 1000)} TB used
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Wifi className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Network Status</p>
              <p className="text-2xl font-bold">
                {resources.filter(r => r.type === 'network' && r.status !== 'maintenance').length}/{resources.filter(r => r.type === 'network').length}
              </p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{ 
                width: `${Math.round(
                  (resources.filter(r => r.type === 'network' && r.status !== 'maintenance').length / 
                  Math.max(1, resources.filter(r => r.type === 'network').length)) * 100
                )}%` 
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {resources.filter(r => r.type === 'network' && r.status === 'maintenance').length} in maintenance
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <Building className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Physical Resources</p>
              <p className="text-2xl font-bold">
                {resources.filter(r => ['classroom', 'lab'].includes(r.type)).length}
              </p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-yellow-500 rounded-full" 
              style={{ 
                width: `${Math.round(
                  (resources.filter(r => ['classroom', 'lab'].includes(r.type) && r.status === 'in-use').length / 
                  Math.max(1, resources.filter(r => ['classroom', 'lab'].includes(r.type)).length)) * 100
                )}%` 
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {resources.filter(r => ['classroom', 'lab'].includes(r.type) && r.status === 'in-use').length} in use
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Resource</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Location</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Utilization</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map(resource => (
                <tr key={resource.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{resource.name}</p>
                      {resource.assignedTo && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Assigned to: {resource.assignedTo}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getResourceTypeIcon(resource.type)}
                      <span className="capitalize">{resource.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {resource.location || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(resource.status)}`}>
                      <span className="capitalize">{resource.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className={`h-full rounded-full ${
                            resource.utilization > 80 ? 'bg-red-500' : 
                            resource.utilization > 60 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`} 
                          style={{ width: `${resource.utilization}%` }}
                        ></div>
                      </div>
                      <span className="text-xs whitespace-nowrap">{resource.utilization}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 