import React, { useEffect, useState } from 'react';
import Order from '../Components/Order'
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ErrorDialog from '../Components/ErrorDialog';
import useOrders from '../hooks/useOrders';
import Settings from '../Components/Settings';
import FilterSettings from '../Components/FilterSettings';
import useTranslation from '../hooks/useTranslation';
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

  const { t } = useTranslation()
  const [dontShowAll, setDontShowAll] = useState(true)
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
    const { name, orders, id, firstCreated, togo } = table
    numOfOrders += orders.length
    return <Order key={id} created={firstCreated} tableId={id} name={name} togo={togo} orders={orders} updateOrders={() => setRefreshTimestamp(new Date())} />
  })

  const [openErrorDialog, setOpenErrorDialog] = useState(false)

  // Only after the first response, an empty list while loading isn't "no orders"
  const noOrders = initialized && numOfOrders < 1
  const [snackbarDismissed, setSnackbarDismissed] = useState(false)
  // Show the hint again the next time the list runs empty
  if (!noOrders && snackbarDismissed) {
    setSnackbarDismissed(false)
  }

  function handleClose() {
    setSnackbarDismissed(true)
  }

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
          open={noOrders && !snackbarDismissed}
          autoHideDuration={6000}
          onClose={handleClose}
          message={t('orders.noOrders')}
          action={
            <React.Fragment>
              <Button color="secondary" size="small" onClick={() => setOpenErrorDialog(true)}>
                {t('common.details')}
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
      <Settings badge={!dontShowAll || productIds.length !== filteredProductGroup.length}>
        <FilterSettings dontShowAll={dontShowAll} setDontShowAll={setDontShowAll} filteredProductGroup={filteredProductGroup} setFilteredProductGroup={setFilteredProductGroup} productGroups={productGroups} />
      </Settings>
    </>
  );
}