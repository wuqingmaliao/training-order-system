import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import RoutesComponent from './app.tsx';
import './index.css';
import { createPortal } from 'react-dom';
import { Toaster } from '@client/src/components/ui/sonner';

const MainApp = () => {
  return (
    <BrowserRouter basename="/">
      <RoutesComponent />
      {createPortal(<Toaster />, document.body)}
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<MainApp />);
