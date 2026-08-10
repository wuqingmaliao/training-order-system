import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
