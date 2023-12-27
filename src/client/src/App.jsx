import React, { useEffect } from 'react';
import { Outlet } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import Theme from './Theme';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import { Button } from '@mui/material';
import { useNavigate, useLocation } from "react-router-dom";
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/")
      navigate("orders")
  }, [location.pathname])

  return (
    <ThemeProvider theme={Theme}>
      <AppBar position="static" className={"title"}>
        <Toolbar>
          <Button
            size="large"
            color={location.pathname === '/orders' ? "secondary" : "inherit"}
            onClick={() => navigate("/orders")}>
            Kitchen
          </Button>
          <Button
            size="large"
            color={location.pathname === '/coupons' ? "secondary" : "inherit"}
            onClick={() => navigate("/coupons")}>
            Coupons
          </Button>
        </Toolbar>
      </AppBar>
      <Outlet />
    </ThemeProvider>
  );
}
export default App;
