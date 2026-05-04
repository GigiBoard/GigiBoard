import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Routing from './routes/Routing';
import React from 'react';

const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CssBaseline />
      <Routing />
    </BrowserRouter>
  );
};

export default App;
