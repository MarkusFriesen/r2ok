import React, { useEffect } from 'react';
import useSlidingIndicator from './hooks/useSlidingIndicator';
import { Outlet } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import Theme, { glass } from './Theme';
import AppBar from '@mui/material/AppBar';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useNavigate, useLocation } from "react-router-dom";
import useTranslation from './hooks/useTranslation';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useTranslation();

  // Labels change width with the language, the highlight has to follow
  const [groupProps, indicator] = useSlidingIndicator(`${location.pathname}|${language}`);

  useEffect(() => {
    if (location.pathname === "/")
      navigate("orders")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <ThemeProvider theme={Theme}>
      <AppBar position="sticky" className="nav" sx={glass(0.35)}>
        <ToggleButtonGroup
          {...groupProps}
          exclusive
          value={location.pathname}
          onChange={(_, path) => path && navigate(path)}>
          {indicator}
          <ToggleButton value="/orders">{t('nav.kitchen')}</ToggleButton>
          <ToggleButton value="/coupons">{t('nav.coupons')}</ToggleButton>
        </ToggleButtonGroup>
      </AppBar>
      <Outlet />
    </ThemeProvider>
  );
}
export default App;
