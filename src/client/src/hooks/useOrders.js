import { useEffect, useRef, useState } from "react"
import axios from 'axios'
import { moveDelayMs } from './useItemPlacement'

// Countdown plus time for the slide into the completed section
const hideDelayMs = moveDelayMs + 1000

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
  // True once the first orders arrived, until then an empty list means "still loading"
  const [initialized, setInitialized] = useState(false)
  const [productGroups, setProductGroups] = useState({})
  const [productIdToProductGroup, setProductIdToProductGroup] = useState({})
  // Table id -> when all of its items were first seen completed
  const completedSince = useRef(new Map())
  const loaded = useRef(false)

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
    const hideTimers = []
    const doneSince = completedSince.current

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

          const allDone = filteredOrders.every(o => o.status === 2)
          if (!allDone) {
            doneSince.delete(table)
          } else if (!doneSince.has(table)) {
            // Completed before the page loaded, nothing left to animate
            doneSince.set(table, loaded.current ? Date.now() : -Infinity)
          }

          // Keep a just completed table around so its last item can count down and slide
          const remaining = doneSince.get(table) + hideDelayMs - Date.now()
          if (!dontShowAll || !allDone || remaining > 0) {
            result.push({ id: table, ...data[table], orders: filteredOrders, firstCreated })
          }
          if (dontShowAll && allDone && remaining > 0) {
            hideTimers.push(setTimeout(getOrders, remaining))
          }
        }
      }
      loaded.current = true
      result.sort(sortTables)
      setTables(result)
      setInitialized(true)
    }

    getOrders(() => disposed)

    const intervalId = setInterval(() => {
      getOrders(() => disposed)
    }, 5000);

    return () => {
      disposed = true
      clearInterval(intervalId)
      hideTimers.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dontShowAll, filteredProductGroups.length, refreshTimeStamp])

  return { tables, initialized, setRefreshTimestamp, productGroups, productIdToProductGroup }
}