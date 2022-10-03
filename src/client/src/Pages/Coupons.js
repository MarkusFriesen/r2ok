import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, makeStyles, Paper, Snackbar, TextField, Typography} from '@material-ui/core';
import React, {useState} from 'react';
import useCoupons from '../hooks/useCoupons';
import Barcode from 'react-jsbarcode';
import FileCopy from '@material-ui/icons/FileCopy';
import copy from 'copy-to-clipboard';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';

const useStyles = makeStyles((theme) => ({
  paper: {
    maxWidth: 500,
    margin: '25px auto',
    paddingTop: 15
  },
  search: {
    marginLeft: 15
  },
  filter: {
    width: '100%',
    display: 'grid',
    gridTemplate: 'auto / auto 55px',
    marginBottom: 15
  },
  round: {
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '1rem',

    width: 35,
    padding: 5
  },
  content: {
    padding: 1,
    alignContent: 'center'
  }
}));

function Coupons() {

  const [filter, setFilter] = useState('')
  const [filteredCoupons, loading, refresh] = useCoupons(filter)
  const [open, setOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState()
  const [showSnackbar, setShowSnackbar] = useState(false)
  const closeSnackbar = () => setShowSnackbar(false)
  const classes = useStyles()
  const handleClose = () => setOpen(false)

  const handleCopy = (id) => {
    copy(id)
    handleClose()
    setShowSnackbar(true)
  }

  return (
    <Paper className={classes.paper}>
      <div className={classes.filter} >
        <TextField
          variant="outlined"
          className={classes.search}
          InputProps={{
            endAdornment: <SearchIcon />
          }}
          label="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          disabled={loading}
        />
        <IconButton disabled={loading}>
          <RefreshIcon onClick={async () => await refresh()} />
        </IconButton>
      </div>
      {
        loading ? <LinearProgress /> : undefined
      }
      <List>
        {filteredCoupons.map(c => {
          return (
            <ListItem key={c.id} dense button onClick={() => {
              setSelectedCoupon(c)
              setOpen(true)
            }} >
              <ListItemAvatar>
                <div className={classes.round}>
                  <Typography color="textPrimary" className={classes.content} align="center" >
                    {parseInt(c.value).toFixed(0)}€
                  </Typography>
                </div>
              </ListItemAvatar>
              <ListItemText id={c.id} primary={c?.name} secondary={c?.identifier} />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="comments" onClick={() => {
                  setSelectedCoupon(c)
                  handleCopy(c?.identifier)
                }}>
                  <FileCopy />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          )
        })}
      </List>

      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>{selectedCoupon?.name}</DialogTitle>
        <DialogContent>
          <Barcode value={selectedCoupon?.identifier} options={{format: 'EAN13'}} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCopy(selectedCoupon?.identifier)} color="secondary">Copy</Button>
          <Button onClick={handleClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showSnackbar}
        onClose={closeSnackbar}
        message={`Copied ${selectedCoupon?.identifier} to clipboard `}
        autoHideDuration={3000}
      />
    </Paper>
  );
}
export default Coupons;
