import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Order from '../Components/Order'
import {get} from 'axios'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 15,
    flexGrow: 1,
  },
}));

export default function OrderPage({dontShowAll, showFood, showDrinks}) {
  const classes = useStyles();
  const [tables, setTables] = useState({})
  const [refreshTimeStamp, setRefreshTimestamp] = useState(new Date())

  useEffect(() => {
    let disposed = false

    async function getOrders(isDisposed = () => false) {
      const {status, data} = await get('/orders')
      if (isDisposed()) return

      if (status !== 200) {
        console.error("Unable to get all orders.", status, data)
      }

      const result = {}
      for (const table in data) {
        const allOrders = Object.values(data[table].orders)
        if (allOrders?.length > 0 && (!dontShowAll || !allOrders.every(o => o.made))) {
          result[table] = data[table]

          // Apply Filter
          for (const orderId in result[table].orders) {
            const order = result[table].orders[orderId]
            switch (order.groupType) {
              case 1:
                if (!showFood)
                  delete result[table].orders[orderId]
                break;
              case 2:
                if (!showDrinks)
                  delete result[table].orders[orderId]
                break;
              default:
                break;
            }
          }
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
  }, [dontShowAll, showDrinks, showFood, refreshTimeStamp])


  var content = []
  for (const table in tables) {
    const {name, orders} = tables[table]
    content.push(<Order key={table} tableId={table} name={name} orders={orders} updateOrders={() => setRefreshTimestamp(new Date())} />)
  }
  return (
    <div className={classes.root}>
      <ResponsiveMasonry
        columnsCountBreakPoints={{350: 1, 750: 2, 1280: 3, 1920: 4}}
      >
        <Masonry>
          {content}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
}