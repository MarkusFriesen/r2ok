import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Order from '../Components/Order';
import {get} from 'axios'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 15,
    flexGrow: 1,
  },
}));

export default function OrderPage(props) {
  const classes = useStyles();
  const [tables, setTables] = useState({})
  const [refreshTimeStamp, setRefreshTimestamp] = useState(new Date())
  const { showAll } = props

  useEffect(() => {
    let disposed = false

    async function getOrders(isDisposed = () => false) {
      console.info("Getting Orders")
      const {status, data} = await get('/orders')
      if (isDisposed()) return

      if (status !== 200) {
        console.error("Unable to get all orders.", status, data)
      }

      const result = {}
      for (const table in data) {
        const allOrders = Object.values(data[table].orders)
        if (allOrders?.length > 0 && (showAll || !allOrders.every(o => o.made))) {
          result[table] = data[table]
        }
      }
      setTables(result)
    }

    getOrders(() => disposed)

    const intervalId = setInterval(() => {
      getOrders(() => disposed)
    }, 5000);

    return () => {
      disposed = true
      clearInterval(intervalId)
    }
  }, [showAll, refreshTimeStamp])


  var content = []
  for (const table in tables) {
    const {name, orders} = tables[table]
    content.push(
      <Grid item xs={12} sm={12} md={6} lg={4} xlg={5}  key={table}>
        <Order tableId={table} name={name} orders={orders} updateOrders={() => setRefreshTimestamp(new Date())}/>
      </Grid>)
  }
  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {content}
      </Grid>
    </div>
  );
}