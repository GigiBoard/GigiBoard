import { HashRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Routing from './routes/Routing';
import React from 'react';

const App = () => {
  return (
    <HashRouter>
      <CssBaseline />
      <Routing />
    </HashRouter>
  );
};

export default App;
