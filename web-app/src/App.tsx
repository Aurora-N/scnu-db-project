import MainLayout from '@/layout/main-layout';
import { Outlet } from 'react-router';

function App() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default App;
