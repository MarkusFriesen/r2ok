import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles'
import Order from '../Components/Order'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import {Snackbar} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ErrorDialog from '../Components/ErrorDialog';

const useStyles = makeStyles(() => ({
  root: {
    marginTop: 15,
    flexGrow: 1,
  },
}));

export default function OrderPage({tables, initialized, setRefreshTimestamp}) {
  const classes = useStyles();

  let numOfOrders = 0
  var content = tables.map(table => {
    const {name, orders, id, firstCreated} = table
    numOfOrders += orders.length
    return <Order key={id} created={firstCreated} tableId={id} name={name} orders={orders} updateOrders={() => setRefreshTimestamp(new Date())} />
  })

  const [openErrorDialog, setOpenErrorDialog] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")

  function handleClose() {
    setOpenSnackbar(false)
  }

  useEffect(() => {
    if (!initialized || numOfOrders < 1) return

    setSnackbarMessage("No orders available")
    setOpenSnackbar(true)

  }, [numOfOrders, initialized])

  return (
    <div className={classes.root}>
      <ResponsiveMasonry
        columnsCountBreakPoints={{350: 1, 750: 2, 1280: 3, 1920: 4}}
      >
        <Masonry>
          {content}
        </Masonry>
      </ResponsiveMasonry>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleClose}
        message={snackbarMessage}
        action={
          <React.Fragment>
            <Button color="secondary" size="small" onClick={() => setOpenErrorDialog(true)}>
              Details
            </Button>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        } />

      <ErrorDialog
        open={openErrorDialog}
        setOpen={setOpenErrorDialog} />
    </div>
  );
}