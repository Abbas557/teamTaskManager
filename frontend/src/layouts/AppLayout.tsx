import { FolderKanban, LayoutDashboard, ListTodo, LogOut, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAuth, getStoredUser } from '../features/auth/auth-storage';
import { Button } from '../components/Button';

export function AppLayout() {
  const navigate = useNavigate();
  const user = getStoredUser();

  function logout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">TT</div>
          <div>
            <strong>Team Tasks</strong>
            <span>Workspace</span>
          </div>
        </div>

        <nav className="nav-list">
          <NavLink to="/dashboard">
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/projects">
            <FolderKanban size={18} />
            Projects
          </NavLink>
          <NavLink to="/tasks/my">
            <ListTodo size={18} />
            My Tasks
          </NavLink>
          {user?.role === 'ADMIN' ? (
            <NavLink to="/admin/users">
              <Users size={18} />
              Users
            </NavLink>
          ) : null}
        </nav>

        <div className="sidebar-insight">
          <span>Workspace health</span>
          <strong>Live task tracking</strong>
          <p>Projects, members, and deadlines stay synced with the API.</p>
        </div>

        <div className="sidebar-footer">
          <div className="user-chip">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <Button variant="ghost" onClick={logout}>
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
