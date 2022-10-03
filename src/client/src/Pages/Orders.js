import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles'
import Order from '../Components/Order'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ErrorDialog from '../Components/ErrorDialog';
import useOrders from '../hooks/useOrders';
import FilterIcon from '@material-ui/icons/FilterList';
import Badge from '@material-ui/core/Badge';
import FilterDialog from '../Components/FilterDialog';

const useStyles = makeStyles(() => ({
  root: {
    marginTop: 15,
    flexGrow: 1,
  },
  floatRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    color: "white"
  }
}));

export default function OrderPage() {

  const [dontShowAll, setDontShowAll] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filteredProductGroup, setFilteredProductGroup] = useState([])
  const [productGroupInitialized, setProductGroupInitialized] = useState(false)

  const {tables, initialized, setRefreshTimestamp, productGroups} = useOrders(dontShowAll, filteredProductGroup)

  const productIds = Object.keys(productGroups)
  useEffect(() => {
    if (productGroupInitialized || productIds.length < 1) return

    setProductGroupInitialized(true)
    setFilteredProductGroup(productIds)
  }, [productGroupInitialized, productIds])

  const classes = useStyles();

  let numOfOrders = 0
  var content = tables?.map(table => {
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
    <div>
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
      <div>
        <div className={classes.floatRight}>
          <IconButton color="inherit" onClick={() => setDialogOpen(true)}>
            <Badge color="secondary" variant="dot" overlap="rectangular" invisible={dontShowAll && productIds.length === filteredProductGroup.length}>
              <FilterIcon />
            </Badge>
          </IconButton>
          <FilterDialog dontShowAll={dontShowAll} setDontShowAll={setDontShowAll} filteredProductGroup={filteredProductGroup} setFilteredProductGroup={setFilteredProductGroup} open={dialogOpen} onClose={() => setDialogOpen(false)} productGroups={productGroups} />
        </div>
      </div>
    </div>
  );
}