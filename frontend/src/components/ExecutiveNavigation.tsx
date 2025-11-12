import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home, FileText, Briefcase, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function ExecutiveNavigation() {
    const location = useLocation();
    const { isLoading, hasRole, user } = useAuth();
    const isExecutive = user?.role === 'owner' || hasRole('owner');

  
    
    if (isLoading) {
        return (
            <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-lg z-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
                <p className="text-gray-600">Memverifikasi akses eksekutif...</p>
            </aside>
        );
    }

    if (!isExecutive) {
        return null;
    }

    const mainMenu = [
        { path: '/executive', label: 'Dashboard', icon: Home },
        { path: '/executive/analytics', label: 'Analisis Bisnis', icon: FileText },
        { path: '/executive/reports', label: 'Laporan', icon: FileText },
        { path: '/executive/kemitraan', label: 'Kelola Kemitraan', icon: Briefcase },
        { path: '/executive/system', label: 'Sistem', icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r shadow-lg z-50">
            <div className="h-16 border-b flex items-center px-4">
                <Link to="/executive" className="text-xl font-bold text-primary">
                    Eksekutif Panel
                </Link>
            </div>

            <nav className="p-2 space-y-2 overflow-y-auto h-[calc(100%-4rem)]">
                <div className="space-y-1">
                    {mainMenu.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/executive' && location.pathname.startsWith(item.path));

                        return (
                            <Link key={item.path} to={item.path}>
                                <Button
                                    variant={isActive ? 'default' : 'ghost'}
                                    size="sm"
                                    className="w-full justify-between"
                                >
                                    <span className="flex items-center gap-2">
                                        <IconComponent className="w-4 h-4" />
                                        {item.label}
                                    </span>
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </aside>
    );
}

export default ExecutiveNavigation;
