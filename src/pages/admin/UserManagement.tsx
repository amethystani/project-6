import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  X, 
  Check,
  Lock,
  UserPlus,
  UserX,
  UserCheck,
  Shield
} from 'lucide-react';

// Define types for users
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin' | 'head' | 'guest';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

// Mock data for users
const usersData: User[] = [
  {
    id: 'usr-001',
    name: 'John Smith',
    email: 'john.smith@example.edu',
    role: 'student',
    status: 'active',
    lastLogin: '2024-03-05T10:30:00',
    createdAt: '2023-09-01T08:00:00'
  },
  {
    id: 'usr-002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.edu',
    role: 'faculty',
    status: 'active',
    lastLogin: '2024-03-04T14:45:00',
    createdAt: '2022-08-15T09:30:00'
  },
  {
    id: 'usr-003',
    name: 'Michael Davis',
    email: 'michael.davis@example.edu',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-03-06T09:15:00',
    createdAt: '2021-11-10T11:20:00'
  },
  {
    id: 'usr-004',
    name: 'Emily Chen',
    email: 'emily.chen@example.edu',
    role: 'head',
    status: 'active',
    lastLogin: '2024-03-03T16:20:00',
    createdAt: '2022-01-05T10:15:00'
  },
  {
    id: 'usr-005',
    name: 'Robert Wilson',
    email: 'robert.wilson@example.edu',
    role: 'student',
    status: 'inactive',
    lastLogin: '2024-02-20T11:10:00',
    createdAt: '2023-08-20T13:45:00'
  },
  {
    id: 'usr-006',
    name: 'Jennifer Lopez',
    email: 'jennifer.lopez@example.edu',
    role: 'faculty',
    status: 'active',
    lastLogin: '2024-03-05T08:40:00',
    createdAt: '2022-07-12T09:00:00'
  },
  {
    id: 'usr-007',
    name: 'David Brown',
    email: 'david.brown@example.edu',
    role: 'student',
    status: 'pending',
    lastLogin: '',
    createdAt: '2024-03-01T15:30:00'
  },
];

const UserManagement = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <p>User management content will be implemented here.</p>
    </div>
  );
};

export default UserManagement; 