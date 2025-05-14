import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Vote, ListChecks } from 'lucide-react';

const AdminSidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-neutral-800 text-white hidden md:block">
      <div className="py-6">
        <nav className="px-4">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-700 text-white'
                      : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  }`
                }
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/mps"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-700 text-white'
                      : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  }`
                }
              >
                <Users className="h-5 w-5" />
                <span>MPs</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/votes"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-700 text-white'
                      : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  }`
                }
              >
                <Vote className="h-5 w-5" />
                <span>Votes</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/vote-records"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-700 text-white'
                      : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  }`
                }
              >
                <ListChecks className="h-5 w-5" />
                <span>Vote Records</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;