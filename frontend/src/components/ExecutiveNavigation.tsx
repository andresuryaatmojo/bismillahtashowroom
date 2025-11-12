import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
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
        { path: '/executive/system', label: 'Sistem', icon: Settings },
    ];

    const manajemenGroup = {
        label: 'Manajemen',
        items: [
            { path: '/executive/kemitraan', label: 'Kelola Kemitraan', icon: Briefcase },
        ],
    };

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

                <Accordion type="single" collapsible className="space-y-1">
                    <AccordionItem value={manajemenGroup.label}>
                        <AccordionTrigger className="px-3 py-2 text-sm">
                            {manajemenGroup.label}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-1">
                            {manajemenGroup.items.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = location.pathname.startsWith(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${
                                            isActive ? 'text-primary font-medium' : 'text-gray-700'
                                        }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </nav>
        </aside>
    );
}

export default ExecutiveNavigation;
