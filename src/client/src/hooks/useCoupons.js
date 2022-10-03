/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from "react"
import {get,post} from 'axios'

export default function useCoupons(filter){

  const [coupons, setCoupons] = useState([])
  const [filteredCoupons, setFilteredCoupons] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [nextFetch, setNextFetch] = useState(new Date())

  useEffect(() => {
    setFilteredCoupons(coupons.filter(c => !filter || c.name.includes(filter)))
  }, [filter, coupons.length])

  useEffect(() => {
    let disposed = false
    async function getData() {
      
      setError(null)
      setLoading(true)
      const {status, data} = await get('/coupons')
      setLoading(false)

      if (disposed) return

      if (status !== 200) {
        console.error("Unable to get products", status, data)
        setError("Failed to fetch products")
        return
      }

      setCoupons(data)
    }

    getData()
    return () => disposed = true
  }, [nextFetch])

  const refresh = async () => {
    setLoading(true)
    await post('/coupons/refresh')
    setNextFetch(new Date())
  }

  return [filteredCoupons.slice(0, 20), loading, refresh, error]
}