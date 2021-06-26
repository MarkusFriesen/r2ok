import React, {useState} from 'react';
import {ThemeProvider, makeStyles} from '@material-ui/core/styles';
import Theme from './Theme';
import OrderPage from './Pages/OrderPage';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton'; 
import FilterIcon from '@material-ui/icons/FilterList';
import Badge from '@material-ui/core/Badge';
import FilterDialog from './Components/FilterDialog';

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
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <ThemeProvider theme={Theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Ready2Order Kitchen
          </Typography>

          <IconButton color="inherit" onClick={() => setDialogOpen(true)}>
            <Badge color="secondary" variant="dot" invisible={!showAll}>
              <FilterIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <FilterDialog showAll={showAll} setShowAll={setShowAll} open={dialogOpen} onClose={() => setDialogOpen(false)} />
      <OrderPage showAll={showAll}/>
    </ThemeProvider>
  );
}
export default App;
