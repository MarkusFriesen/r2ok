/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {Outlet} from "react-router-dom";
import {ThemeProvider, makeStyles} from '@material-ui/core/styles';
import Theme from './Theme';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import {Button} from '@material-ui/core';
import {useNavigate, useLocation} from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 3,
  },
  "@global": {
    body: {
      margin: 0
    }
  }
}));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (location.pathname === "/")
      navigate("/orders")
  }, [location.pathname])
  
  const classes = useStyles();

  return (
    <ThemeProvider theme={Theme}>
      <AppBar position="static" className={classes.title}>
        <Toolbar>
          <Button 
            size="large" 
            color={location.pathname === '/orders' ? "secondary": "inherit"} 
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
