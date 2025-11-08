import MainLayout from '@/layout/main-layout';
import { Outlet } from 'react-router';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <>
      <MainLayout>
        <Outlet />
      </MainLayout>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
