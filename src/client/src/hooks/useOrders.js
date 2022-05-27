import {useEffect, useState} from "react"
import {get} from 'axios'

export default function useOrders(dontShowAll, showFood, showDrinks){

  const [refreshTimeStamp, setRefreshTimestamp] = useState(new Date())
  const [initialized, setInitialized] = useState(true)
  const [tables, setTables] = useState({})

  useEffect(() => {
    let disposed = false

    async function getOrders(isDisposed = () => false) {
      const {status, data} = await get('/orders')
      if (isDisposed()) return

      setInitialized(true)

      if (status !== 200) {
        console.error("Unable to get all orders.", status, data)
      }

      const result = {}
      for (const table in data) {
        let allOrders = Object.values(data[table].orders)
        if (allOrders?.length > 0) {

          // Apply Filter
          for (const orderId in data[table].orders) {
            const order = data[table].orders[orderId]
            switch (order.groupType) {
              case 1:
                if (!showFood)
                  delete data[table].orders[orderId]
                break;
              case 2:
                if (!showDrinks)
                  delete data[table].orders[orderId]
                break;
              default:
                break;
            }
          }

          allOrders = Object.values(data[table].orders)

          if ((!dontShowAll || !allOrders.every(o => o.made))) {
            result[table] = data[table]
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
  }, [dontShowAll, showDrinks, showFood, initialized, refreshTimeStamp])

  return {tables, setRefreshTimestamp}

}