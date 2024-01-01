import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import useCoupons from '../hooks/useCoupons';
import Barcode from 'react-jsbarcode';
import FileCopy from '@mui/icons-material/FileCopy';
import copy from 'copy-to-clipboard';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import "./Coupons.css"

function Coupons() {

  const [filter, setFilter] = useState('')
  const [filteredCoupons, loading, refresh] = useCoupons(filter)
  const [open, setOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState()
  const [showSnackbar, setShowSnackbar] = useState(false)
  const closeSnackbar = () => setShowSnackbar(false)
  const handleClose = () => setOpen(false)

  const handleCopy = (id) => {
    copy(id)
    handleClose()
    setShowSnackbar(true)
  }

  return (
    <Paper className="paper">
      <div className="filter" >
        <TextField
          variant="outlined"
          className="search"
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
                <div className="round">
                  <Typography color="textPrimary" className="content" align="center" >
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
          <Barcode value={selectedCoupon?.identifier} options={{ format: 'EAN13' }} />
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
