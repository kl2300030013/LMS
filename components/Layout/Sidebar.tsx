import React from 'react';
import { 
  Home, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Award, 
  Users, 
  Settings,
  PlusCircle,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, onTabChange }) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['student', 'instructor', 'admin'] },
    { id: 'courses', label: 'Courses', icon: BookOpen, roles: ['student', 'instructor', 'admin'] },
    { id: 'assignments', label: 'Assignments', icon: FileText, roles: ['student', 'instructor', 'admin'] },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare, roles: ['student', 'instructor', 'admin'] },
    { id: 'create-course', label: 'Create Course', icon: PlusCircle, roles: ['instructor', 'admin'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['instructor', 'admin'] },
    { id: 'certificates', label: 'Certificates', icon: Award, roles: ['student'] },
    { id: 'users', label: 'Users', icon: Users, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['student', 'instructor', 'admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'student')
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => {}}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-30
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full pt-20">
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg
                        transition-all duration-200 font-medium
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
              <h3 className="font-semibold text-sm">Need Help?</h3>
              <p className="text-xs opacity-90 mt-1">
                Check our documentation or contact support
              </p>
              <button className="mt-2 text-xs bg-white bg-opacity-20 px-3 py-1 rounded hover:bg-opacity-30 transition-colors">
                Get Support
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;