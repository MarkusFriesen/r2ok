import {useEffect, useState} from "react"
import {get} from 'axios'

function sortOrdersByCreated(a, b) {
  if (a.created > b.created) return 1
  else if (b.created > a.created) return -1

  if (a.id > b.id) return 1
  else return -1
}

function sortTables(a, b) {
  if (a.firstCreated > b.firstCreated) return 1
  else return -1
}

function FilterData(data, table, showFood, showDrinks) {
  const allOrders = []
  let firstCreated;
  for (const orderId in data[table].orders) {
    const order = data[table].orders[orderId]
    if (order.groupType === 1 && !showFood) continue
    if (order.groupType === 2 && !showDrinks) continue
    allOrders.push({...order, id: orderId})
    if (firstCreated && firstCreated > order.created) continue
    firstCreated = order.created
  }

  allOrders.sort(sortOrdersByCreated)

  return [allOrders, firstCreated]
}

export default function useOrders(dontShowAll, showFood, showDrinks) {

  const [refreshTimeStamp, setRefreshTimestamp] = useState(new Date())
  const [tables, setTables] = useState([])

  useEffect(() => {
    let disposed = false

    async function getOrders(isDisposed = () => false) {
      const {status, data} = await get('/orders')
      if (isDisposed()) return

      if (status !== 200) {
        console.error("Unable to get all orders.", status, data)
      }

      const result = []
      for (const table in data) {
        let allOrders = Object.values(data[table].orders)
        let firstCreated
        if (allOrders?.length > 0) {

          // Apply Filter
          [allOrders, firstCreated] = FilterData(data, table, showFood, showDrinks)

          if ((!dontShowAll || !allOrders.every(o => o.made))) {
            result.push({id: table, ...data[table], orders: allOrders, firstCreated})
          }
        }
      }
      result.sort(sortTables)
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

  return {tables, setRefreshTimestamp}
}