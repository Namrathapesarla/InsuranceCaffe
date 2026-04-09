import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`main-area ${collapsed ? 'main-area-full' : ''}`}>
        <Header onMenuToggle={() => setCollapsed(!collapsed)} />
        <main style={{ padding: '1.5rem 2rem', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
