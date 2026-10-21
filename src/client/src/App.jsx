import React, { useEffect } from 'react';
import useSlidingIndicator from './hooks/useSlidingIndicator';
import { Outlet } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import Theme, { glass } from './Theme';
import AppBar from '@mui/material/AppBar';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useNavigate, useLocation } from "react-router-dom";
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [groupProps, indicator] = useSlidingIndicator(location.pathname);

  useEffect(() => {
    if (location.pathname === "/")
      navigate("orders")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <ThemeProvider theme={Theme}>
      <AppBar position="sticky" className="nav" sx={glass(0.5)}>
        <ToggleButtonGroup
          {...groupProps}
          exclusive
          value={location.pathname}
          onChange={(_, path) => path && navigate(path)}>
          {indicator}
          <ToggleButton value="/orders">Kitchen</ToggleButton>
          <ToggleButton value="/coupons">Coupons</ToggleButton>
        </ToggleButtonGroup>
      </AppBar>
      <Outlet />
    </ThemeProvider>
  );
}
export default App;
