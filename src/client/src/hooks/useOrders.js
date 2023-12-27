import { useEffect, useState } from "react"
import axios from 'axios'

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

export default function useOrders(dontShowAll, filteredProductGroups) {

  const [refreshTimeStamp, setRefreshTimestamp] = useState(new Date())
  const [tables, setTables] = useState([])
  const [productGroups, setProductGroups] = useState({})
  const [productIdToProductGroup, setProductIdToProductGroup] = useState({})

  function FilterData(data, table) {
    const allOrders = []
    let firstCreated;
    let firstCreatedStatus = 2

    for (const orderId in data[table].orders) {
      const order = data[table].orders[orderId]
      allOrders.push({ ...order, id: orderId, inFilter: filteredProductGroups.includes(`${productIdToProductGroup[order.productId]?.id}`) })

      if (!firstCreated) {
        firstCreated = order.created
        firstCreatedStatus = order.status
      } else if (order.status < 2 && (firstCreatedStatus === 2 || firstCreated > order.created)) {
        firstCreated = order.created
        firstCreatedStatus = order.status
      }
    }

    allOrders.sort(sortOrdersByCreated)

    return [allOrders, firstCreated]
  }

  useEffect(() => {
    let disposed = false
    async function getData() {
      const { status, data } = await axios.get('/api/productsToProductGroup')
      if (disposed)

        if (status !== 200) {
          console.error("Unable to get products", status, data)
          return
        }

      setProductIdToProductGroup(data)
      const productGroups = {}
      Object.values(data).forEach(d => {
        productGroups[d.id] = d.name
      })

      setProductGroups(productGroups)
    }

    getData()
    return () => disposed = true
  }, [])

  useEffect(() => {
    let disposed = false

    async function getOrders() {
      const { status, data } = await axios.get('/api/orders')
      if (disposed) return

      if (status !== 200) {
        console.error("Unable to get all orders.", status, data)
      }

      const result = []
      for (const table in data) {
        let allOrders = Object.values(data[table].orders)

        if (allOrders?.length > 0) {

          // Apply Filter
          let [filteredOrders, firstCreated] = FilterData(data, table, filteredProductGroups)

          if ((!dontShowAll || !filteredOrders.every(o => o.status === 2))) {
            result.push({ id: table, ...data[table], orders: filteredOrders, firstCreated })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dontShowAll, filteredProductGroups.length, refreshTimeStamp])

  return { tables, setRefreshTimestamp, productGroups, productIdToProductGroup }
}