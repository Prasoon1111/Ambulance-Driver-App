import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-aside">
        <Sidebar />
      </aside>
      <div className="dashboard-shell">
        <Navbar />
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
