import React, {useState} from 'react';
import {ThemeProvider, makeStyles} from '@material-ui/core/styles';
import Theme from './Theme';
import OrderPage from './Pages/OrderPage';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton'; 
import SelectAllIcon  from '@material-ui/icons/SelectAll';
import TabUnselectedIcon from '@material-ui/icons/TabUnselected';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  "@global": {
    body: {
      margin: 0
    }
  }
}));

function App() {
  const classes = useStyles();
  const [showAll, setShowAll] = useState(false)

  const icon = showAll ? <TabUnselectedIcon /> : <SelectAllIcon />
  return (
    <ThemeProvider theme={Theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Ready2Order Kitchen
          </Typography>

          <IconButton color="inherit" onClick={() => setShowAll(!showAll)}>
            {icon}
          </IconButton>
        </Toolbar>
      </AppBar>
      <OrderPage showAll={showAll}/>
    </ThemeProvider>
  );
}
export default App;
