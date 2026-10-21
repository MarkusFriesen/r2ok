import React, { useEffect, useState } from 'react';
import Order from '../Components/Order'
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ErrorDialog from '../Components/ErrorDialog';
import useOrders from '../hooks/useOrders';
import FilterIcon from '@mui/icons-material/FilterList';
import Badge from '@mui/material/Badge';
import FilterDialog from '../Components/FilterDialog';
import "./Orders.css"

// Masonry >= 2.9 drops empty columns, so a few cards would stretch across the
// whole page. Pin every column to 1/N of the width like before.
function FixedColumnsMasonry({ columnsCount = 1, children }) {
  return (
    <Masonry
      columnsCount={columnsCount}
      style={{ justifyContent: "flex-start" }}
      itemStyle={{ flex: `0 0 ${100 / columnsCount}%`, minWidth: 0 }}>
      {children}
    </Masonry>
  )
}

export default function OrderPage() {

  const [dontShowAll, setDontShowAll] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filteredProductGroup, setFilteredProductGroup] = useState([])
  const [productGroupInitialized, setProductGroupInitialized] = useState(false)

  const { tables, initialized, setRefreshTimestamp, productGroups } = useOrders(dontShowAll, filteredProductGroup)

  const productIds = Object.keys(productGroups)
  useEffect(() => {
    if (productGroupInitialized || productIds.length < 1) return

    setProductGroupInitialized(true)
    setFilteredProductGroup(productIds)
  }, [productGroupInitialized, productIds])

  let numOfOrders = 0
  const content = tables?.map(table => {
    const { name, orders, id, firstCreated } = table
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
    <>
      <div className="order-root">
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 1, 750: 2, 1280: 3, 1920: 4 }}
        >
          <FixedColumnsMasonry>
            {content}
          </FixedColumnsMasonry>
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
      <section className="float-right">
        <IconButton className="glass-button" aria-label="filter" onClick={() => setDialogOpen(true)}>
          <Badge color="secondary" variant="dot" overlap="rectangular" invisible={dontShowAll && productIds.length === filteredProductGroup.length}>
            <FilterIcon />
          </Badge>
        </IconButton>
        <FilterDialog dontShowAll={dontShowAll} setDontShowAll={setDontShowAll} filteredProductGroup={filteredProductGroup} setFilteredProductGroup={setFilteredProductGroup} open={dialogOpen} onClose={() => setDialogOpen(false)} productGroups={productGroups} />
      </section>
    </>
  );
}