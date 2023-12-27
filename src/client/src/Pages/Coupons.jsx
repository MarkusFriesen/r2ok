import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Paper, Snackbar, TextField, Typography } from '@mui/material';
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
