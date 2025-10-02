import React, { useState, useEffect } from 'react';
import './DashboardAdmin.css';

// Interface untuk System Monitoring
interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  responseTime: number;
}

// Interface untuk User Management
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date;
  createdAt: Date;
  avatar?: string;
  permissions: string[];
  department?: string;
  loginCount: number;
}

// Interface untuk System Configuration
interface SystemConfig {
  id: string;
  category: 'general' | 'security' | 'performance' | 'notification' | 'integration';
  name: string;
  value: string | number | boolean;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'json';
  options?: string[];
  isEditable: boolean;
  lastModified: Date;
  modifiedBy: string;
}

// Interface untuk Security Management
interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'permission_change' | 'data_access' | 'system_change' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userName?: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: 'resolved' | 'investigating' | 'open';
  details: Record<string, any>;
}

// Interface untuk System Maintenance
interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  type: 'backup' | 'update' | 'cleanup' | 'optimization' | 'security_patch';
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  progress: number;
  assignedTo: string;
  result?: string;
  logs: string[];
}

// Interface untuk Status Halaman
interface StatusHalaman {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  activeSection: 'monitoring' | 'users' | 'config' | 'security' | 'maintenance' | null;
  selectedUserId: string | null;
  selectedConfigId: string | null;
  selectedSecurityEventId: string | null;
  selectedMaintenanceId: string | null;
  showUserModal: boolean;
  showConfigModal: boolean;
  showSecurityModal: boolean;
  showMaintenanceModal: boolean;
}

const DashboardAdmin: React.FC = () => {
  // State management
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: '0d 0h 0m',
    activeUsers: 0,
    totalRequests: 0,
    errorRate: 0,
    responseTime: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [systemConfigs, setSystemConfigs] = useState<SystemConfig[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [status, setStatus] = useState<StatusHalaman>({
    isLoading: false,
    error: null,
    success: null,
    activeSection: null,
    selectedUserId: null,
    selectedConfigId: null,
    selectedSecurityEventId: null,
    selectedMaintenanceId: null,
    showUserModal: false,
    showConfigModal: false,
    showSecurityModal: false,
    showMaintenanceModal: false
  });

  // Generate mock data
  const generateMockSystemMetrics = (): SystemMetrics => {
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100),
      network: Math.floor(Math.random() * 1000),
      uptime: `${Math.floor(Math.random() * 30)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
      activeUsers: Math.floor(Math.random() * 500) + 50,
      totalRequests: Math.floor(Math.random() * 10000) + 1000,
      errorRate: Math.random() * 5,
      responseTime: Math.floor(Math.random() * 500) + 100
    };
  };

  const generateMockUsers = (): User[] => {
    const roles: User['role'][] = ['admin', 'manager', 'staff', 'customer'];
    const statuses: User['status'][] = ['active', 'inactive', 'suspended'];
    const departments = ['IT', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations'];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@mobilindo.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      avatar: `https://ui-avatars.com/api/?name=User+${i + 1}&background=random`,
      permissions: ['read', 'write', 'delete'].slice(0, Math.floor(Math.random() * 3) + 1),
      department: departments[Math.floor(Math.random() * departments.length)],
      loginCount: Math.floor(Math.random() * 1000) + 10
    }));
  };

  const generateMockConfigs = (): SystemConfig[] => {
    const categories: SystemConfig['category'][] = ['general', 'security', 'performance', 'notification', 'integration'];
    const types: SystemConfig['type'][] = ['string', 'number', 'boolean', 'select'];
    
    return Array.from({ length: 15 }, (_, i) => ({
      id: `config-${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      name: `Configuration ${i + 1}`,
      value: Math.random() > 0.5 ? `Value ${i + 1}` : Math.floor(Math.random() * 100),
      description: `Description for configuration ${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      options: Math.random() > 0.5 ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      isEditable: Math.random() > 0.3,
      lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      modifiedBy: `Admin ${Math.floor(Math.random() * 3) + 1}`
    }));
  };

  const generateMockSecurityEvents = (): SecurityEvent[] => {
    const types: SecurityEvent['type'][] = ['login_attempt', 'permission_change', 'data_access', 'system_change', 'suspicious_activity'];
    const severities: SecurityEvent['severity'][] = ['low', 'medium', 'high', 'critical'];
    const statuses: SecurityEvent['status'][] = ['resolved', 'investigating', 'open'];
    
    return Array.from({ length: 25 }, (_, i) => ({
      id: `security-${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      userId: `user-${Math.floor(Math.random() * 20) + 1}`,
      userName: `User ${Math.floor(Math.random() * 20) + 1}`,
      description: `Security event ${i + 1} description`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      details: { action: `Action ${i + 1}`, resource: `Resource ${i + 1}` }
    }));
  };

  const generateMockMaintenanceTasks = (): MaintenanceTask[] => {
    const types: MaintenanceTask['type'][] = ['backup', 'update', 'cleanup', 'optimization', 'security_patch'];
    const statuses: MaintenanceTask['status'][] = ['scheduled', 'running', 'completed', 'failed', 'cancelled'];
    const priorities: MaintenanceTask['priority'][] = ['low', 'medium', 'high', 'critical'];
    
    return Array.from({ length: 12 }, (_, i) => ({
      id: `maintenance-${i + 1}`,
      title: `Maintenance Task ${i + 1}`,
      description: `Description for maintenance task ${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      scheduledAt: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      startedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : undefined,
      completedAt: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000) : undefined,
      duration: Math.random() > 0.5 ? Math.floor(Math.random() * 120) + 10 : undefined,
      progress: Math.floor(Math.random() * 100),
      assignedTo: `Admin ${Math.floor(Math.random() * 3) + 1}`,
      result: Math.random() > 0.5 ? `Task completed successfully` : undefined,
      logs: [`Log entry 1 for task ${i + 1}`, `Log entry 2 for task ${i + 1}`]
    }));
  };

  // Load initial data
  useEffect(() => {
    setStatus(prev => ({ ...prev, isLoading: true }));
    
    setTimeout(() => {
      setSystemMetrics(generateMockSystemMetrics());
      setUsers(generateMockUsers());
      setSystemConfigs(generateMockConfigs());
      setSecurityEvents(generateMockSecurityEvents());
      setMaintenanceTasks(generateMockMaintenanceTasks());
      setStatus(prev => ({ ...prev, isLoading: false }));
    }, 1000);
  }, []);

  // Update system metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(generateMockSystemMetrics());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Method: aksesMenuAdministrasiSistem
  const aksesMenuAdministrasiSistem = () => {
    setStatus(prev => ({ ...prev, activeSection: null }));
  };

  // Method: pilihSystemMonitoring
  const pilihSystemMonitoring = () => {
    setStatus(prev => ({ ...prev, isLoading: true, activeSection: 'monitoring' }));
    
    setTimeout(() => {
      setSystemMetrics(generateMockSystemMetrics());
      setStatus(prev => ({ ...prev, isLoading: false }));
    }, 500);
  };

  // Method: pilihUserManagement
  const pilihUserManagement = () => {
    setStatus(prev => ({ ...prev, isLoading: true, activeSection: 'users' }));
    
    setTimeout(() => {
      setUsers(generateMockUsers());
      setStatus(prev => ({ ...prev, isLoading: false }));
    }, 500);
  };

  // Method: pilihSystemConfiguration
  const pilihSystemConfiguration = () => {
    setStatus(prev => ({ ...prev, isLoading: true, activeSection: 'config' }));
    
    setTimeout(() => {
      setSystemConfigs(generateMockConfigs());
      setStatus(prev => ({ ...prev, isLoading: false }));
    }, 500);
  };

  // Method: pilihSecurityManagement
  const pilihSecurityManagement = () => {
    setStatus(prev => ({ ...prev, isLoading: true, activeSection: 'security' }));
    
    setTimeout(() => {
      setSecurityEvents(generateMockSecurityEvents());
      setStatus(prev => ({ ...prev, isLoading: false }));
    }, 500);
  };

  // Method: pilihSystemMaintenance
  const pilihSystemMaintenance = () => {
    setStatus(prev => ({ ...prev, isLoading: true, activeSection: 'maintenance' }));
    
    setTimeout(() => {
      setMaintenanceTasks(generateMockMaintenanceTasks());
      setStatus(prev => ({ ...prev, isLoading: false }));
    }, 500);
  };

  // Method: cekAksiLain
  const cekAksiLain = (action: string, id?: string) => {
    setStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      switch (action) {
        case 'refresh_metrics':
          setSystemMetrics(generateMockSystemMetrics());
          break;
        case 'export_users':
          // Simulate export
          break;
        case 'backup_config':
          // Simulate backup
          break;
        case 'resolve_security':
          if (id) {
            setSecurityEvents(prev => prev.map(event => 
              event.id === id ? { ...event, status: 'resolved' as const } : event
            ));
          }
          break;
        case 'run_maintenance':
          if (id) {
            setMaintenanceTasks(prev => prev.map(task => 
              task.id === id ? { ...task, status: 'running' as const, startedAt: new Date() } : task
            ));
          }
          break;
        default:
          throw new Error('Unknown action');
      }
      
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false,
        success: `Aksi ${action} berhasil dijalankan` 
      }));
      
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: null }));
      }, 3000);
      
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Gagal menjalankan aksi ${action}` 
      }));
      setTimeout(() => {
        setStatus(prev => ({ ...prev, error: null }));
      }, 3000);
    }
  };

  // Helper functions
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'resolved':
        return 'success';
      case 'inactive':
      case 'scheduled':
      case 'investigating':
        return 'warning';
      case 'suspended':
      case 'failed':
      case 'cancelled':
        return 'danger';
      case 'running':
      case 'open':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getSeverityColor = (severity: SecurityEvent['severity']): string => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: MaintenanceTask['priority']): string => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getMetricColor = (value: number, type: string): string => {
    if (type === 'cpu' || type === 'memory' || type === 'disk') {
      if (value > 80) return 'danger';
      if (value > 60) return 'warning';
      return 'success';
    }
    if (type === 'errorRate') {
      if (value > 5) return 'danger';
      if (value > 2) return 'warning';
      return 'success';
    }
    return 'info';
  };

  if (status.isLoading && !status.activeSection) {
    return (
      <div className="dashboard-admin">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-admin">
      {/* Header */}
      <div className="admin-header">
        <div className="header-left">
          <h1>Dashboard Administrasi Sistem</h1>
          <p>Kelola dan monitor sistem secara komprehensif</p>
        </div>
        <div className="header-right">
          <button
            onClick={aksesMenuAdministrasiSistem}
            className="btn btn-secondary"
          >
            Menu Utama
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {status.error && (
        <div className="alert alert-error">
          <span>⚠️ {status.error}</span>
        </div>
      )}
      {status.success && (
        <div className="alert alert-success">
          <span>✅ {status.success}</span>
        </div>
      )}

      {/* Main Content */}
      {!status.activeSection ? (
        /* Admin Menu */
        <div className="admin-menu">
          <div className="menu-grid">
            <div className="menu-card" onClick={pilihSystemMonitoring}>
              <div className="menu-icon">📊</div>
              <h3>System Monitoring</h3>
              <p>Monitor performa sistem real-time</p>
              <div className="menu-stats">
                <span>CPU: {systemMetrics.cpu}%</span>
                <span>Memory: {systemMetrics.memory}%</span>
              </div>
            </div>

            <div className="menu-card" onClick={pilihUserManagement}>
              <div className="menu-icon">👥</div>
              <h3>User Management</h3>
              <p>Kelola pengguna dan permissions</p>
              <div className="menu-stats">
                <span>{users.length} Total Users</span>
                <span>{users.filter(u => u.status === 'active').length} Active</span>
              </div>
            </div>

            <div className="menu-card" onClick={pilihSystemConfiguration}>
              <div className="menu-icon">⚙️</div>
              <h3>System Configuration</h3>
              <p>Konfigurasi sistem dan aplikasi</p>
              <div className="menu-stats">
                <span>{systemConfigs.length} Configurations</span>
                <span>{systemConfigs.filter(c => c.isEditable).length} Editable</span>
              </div>
            </div>

            <div className="menu-card" onClick={pilihSecurityManagement}>
              <div className="menu-icon">🔒</div>
              <h3>Security Management</h3>
              <p>Monitor keamanan dan audit log</p>
              <div className="menu-stats">
                <span>{securityEvents.filter(e => e.status === 'open').length} Open Events</span>
                <span>{securityEvents.filter(e => e.severity === 'critical').length} Critical</span>
              </div>
            </div>

            <div className="menu-card" onClick={pilihSystemMaintenance}>
              <div className="menu-icon">🔧</div>
              <h3>System Maintenance</h3>
              <p>Jadwal dan monitor maintenance</p>
              <div className="menu-stats">
                <span>{maintenanceTasks.filter(t => t.status === 'scheduled').length} Scheduled</span>
                <span>{maintenanceTasks.filter(t => t.status === 'running').length} Running</span>
              </div>
            </div>

            <div className="menu-card" onClick={() => cekAksiLain('system_overview')}>
              <div className="menu-icon">📈</div>
              <h3>System Overview</h3>
              <p>Ringkasan status sistem</p>
              <div className="menu-stats">
                <span>Uptime: {systemMetrics.uptime}</span>
                <span>{systemMetrics.activeUsers} Active Users</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Section Content */
        <div className="admin-content">
          {status.activeSection === 'monitoring' && (
            <div className="monitoring-section">
              <div className="section-header">
                <h2>System Monitoring</h2>
                <button
                  onClick={() => cekAksiLain('refresh_metrics')}
                  className="btn btn-primary"
                  disabled={status.isLoading}
                >
                  {status.isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <h3>CPU Usage</h3>
                    <span className={`metric-value metric-${getMetricColor(systemMetrics.cpu, 'cpu')}`}>
                      {systemMetrics.cpu}%
                    </span>
                  </div>
                  <div className="metric-progress">
                    <div 
                      className={`progress-bar progress-${getMetricColor(systemMetrics.cpu, 'cpu')}`}
                      style={{ width: `${systemMetrics.cpu}%` }}
                    ></div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <h3>Memory Usage</h3>
                    <span className={`metric-value metric-${getMetricColor(systemMetrics.memory, 'memory')}`}>
                      {systemMetrics.memory}%
                    </span>
                  </div>
                  <div className="metric-progress">
                    <div 
                      className={`progress-bar progress-${getMetricColor(systemMetrics.memory, 'memory')}`}
                      style={{ width: `${systemMetrics.memory}%` }}
                    ></div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <h3>Disk Usage</h3>
                    <span className={`metric-value metric-${getMetricColor(systemMetrics.disk, 'disk')}`}>
                      {systemMetrics.disk}%
                    </span>
                  </div>
                  <div className="metric-progress">
                    <div 
                      className={`progress-bar progress-${getMetricColor(systemMetrics.disk, 'disk')}`}
                      style={{ width: `${systemMetrics.disk}%` }}
                    ></div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <h3>Network I/O</h3>
                    <span className="metric-value metric-info">
                      {formatBytes(systemMetrics.network * 1024)}/s
                    </span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <h3>System Uptime</h3>
                    <span className="metric-value metric-success">
                      {systemMetrics.uptime}
                    </span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <h3>Active Users</h3>
                    <span className="metric-value metric-info">
                      {systemMetrics.activeUsers}
                    </span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <h3>Total Requests</h3>
                    <span className="metric-value metric-info">
                      {systemMetrics.totalRequests.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <h3>Error Rate</h3>
                    <span className={`metric-value metric-${getMetricColor(systemMetrics.errorRate, 'errorRate')}`}>
                      {systemMetrics.errorRate.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <h3>Response Time</h3>
                    <span className="metric-value metric-info">
                      {systemMetrics.responseTime}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status.activeSection === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h2>User Management</h2>
                <div className="section-actions">
                  <button
                    onClick={() => cekAksiLain('export_users')}
                    className="btn btn-secondary"
                  >
                    Export Users
                  </button>
                  <button
                    onClick={() => setStatus(prev => ({ ...prev, showUserModal: true }))}
                    className="btn btn-primary"
                  >
                    Add User
                  </button>
                </div>
              </div>

              <div className="users-stats">
                <div className="stat-card">
                  <span className="stat-number">{users.length}</span>
                  <span className="stat-label">Total Users</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{users.filter(u => u.status === 'active').length}</span>
                  <span className="stat-label">Active</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
                  <span className="stat-label">Admins</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{users.filter(u => u.status === 'suspended').length}</span>
                  <span className="stat-label">Suspended</span>
                </div>
              </div>

              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Department</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info">
                            <img src={user.avatar} alt={user.name} className="user-avatar" />
                            <div>
                              <div className="user-name">{user.name}</div>
                              <div className="user-email">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${user.role === 'admin' ? 'danger' : user.role === 'manager' ? 'warning' : 'info'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.department}</td>
                        <td>{formatDate(user.lastLogin)}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn btn-sm btn-info">Edit</button>
                            <button className="btn btn-sm btn-warning">Suspend</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {status.activeSection === 'config' && (
            <div className="config-section">
              <div className="section-header">
                <h2>System Configuration</h2>
                <button
                  onClick={() => cekAksiLain('backup_config')}
                  className="btn btn-secondary"
                >
                  Backup Config
                </button>
              </div>

              <div className="config-categories">
                {['general', 'security', 'performance', 'notification', 'integration'].map(category => (
                  <div key={category} className="config-category">
                    <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                    <div className="config-items">
                      {systemConfigs.filter(config => config.category === category).map(config => (
                        <div key={config.id} className="config-item">
                          <div className="config-info">
                            <div className="config-name">{config.name}</div>
                            <div className="config-description">{config.description}</div>
                            <div className="config-meta">
                              Last modified: {formatDate(config.lastModified)} by {config.modifiedBy}
                            </div>
                          </div>
                          <div className="config-value">
                            <span className={`config-type config-type-${config.type}`}>
                              {config.type}
                            </span>
                            <span className="config-current-value">
                              {typeof config.value === 'boolean' ? (config.value ? 'Enabled' : 'Disabled') : String(config.value)}
                            </span>
                            {config.isEditable && (
                              <button className="btn btn-sm btn-primary">Edit</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status.activeSection === 'security' && (
            <div className="security-section">
              <div className="section-header">
                <h2>Security Management</h2>
                <div className="security-stats">
                  <span className="security-stat critical">
                    {securityEvents.filter(e => e.severity === 'critical').length} Critical
                  </span>
                  <span className="security-stat high">
                    {securityEvents.filter(e => e.severity === 'high').length} High
                  </span>
                  <span className="security-stat open">
                    {securityEvents.filter(e => e.status === 'open').length} Open
                  </span>
                </div>
              </div>

              <div className="security-events">
                {securityEvents.map(event => (
                  <div key={event.id} className={`security-event security-${event.severity}`}>
                    <div className="event-header">
                      <div className="event-type">{event.type.replace('_', ' ')}</div>
                      <div className="event-meta">
                        <span className={`badge badge-${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                        <span className={`badge badge-${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <span className="event-time">{formatDate(event.timestamp)}</span>
                      </div>
                    </div>
                    <div className="event-description">{event.description}</div>
                    <div className="event-details">
                      <span>User: {event.userName}</span>
                      <span>IP: {event.ipAddress}</span>
                      {event.status === 'open' && (
                        <button
                          onClick={() => cekAksiLain('resolve_security', event.id)}
                          className="btn btn-sm btn-success"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status.activeSection === 'maintenance' && (
            <div className="maintenance-section">
              <div className="section-header">
                <h2>System Maintenance</h2>
                <button
                  onClick={() => setStatus(prev => ({ ...prev, showMaintenanceModal: true }))}
                  className="btn btn-primary"
                >
                  Schedule Task
                </button>
              </div>

              <div className="maintenance-stats">
                <div className="stat-card">
                  <span className="stat-number">{maintenanceTasks.filter(t => t.status === 'scheduled').length}</span>
                  <span className="stat-label">Scheduled</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{maintenanceTasks.filter(t => t.status === 'running').length}</span>
                  <span className="stat-label">Running</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{maintenanceTasks.filter(t => t.status === 'completed').length}</span>
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{maintenanceTasks.filter(t => t.status === 'failed').length}</span>
                  <span className="stat-label">Failed</span>
                </div>
              </div>

              <div className="maintenance-tasks">
                {maintenanceTasks.map(task => (
                  <div key={task.id} className="maintenance-task">
                    <div className="task-header">
                      <div className="task-info">
                        <h4>{task.title}</h4>
                        <p>{task.description}</p>
                      </div>
                      <div className="task-meta">
                        <span className={`badge badge-${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`badge badge-${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="task-type">{task.type}</span>
                      </div>
                    </div>
                    <div className="task-details">
                      <div className="task-schedule">
                        <span>Scheduled: {formatDate(task.scheduledAt)}</span>
                        {task.startedAt && <span>Started: {formatDate(task.startedAt)}</span>}
                        {task.completedAt && <span>Completed: {formatDate(task.completedAt)}</span>}
                        <span>Assigned to: {task.assignedTo}</span>
                      </div>
                      <div className="task-progress">
                        <div className="progress-label">Progress: {task.progress}%</div>
                        <div className="progress-bar-container">
                          <div 
                            className={`progress-bar progress-${getStatusColor(task.status)}`}
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      {task.status === 'scheduled' && (
                        <button
                          onClick={() => cekAksiLain('run_maintenance', task.id)}
                          className="btn btn-sm btn-primary"
                        >
                          Run Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;