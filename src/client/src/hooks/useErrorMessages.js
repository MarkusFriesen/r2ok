import { useEffect, useState } from "react";
import axios from "axios";

const DEFAULT_TITLE = "No errors"
const DEFAULT_DETAILS = "The next orders will be fetched soon"
export default function useErrorMessages({ nextFetchTime }) {
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [details, setDetails] = useState(DEFAULT_DETAILS)

  useEffect(() => {
    let disposed = false
    async function getData() {

      const { data, status } = await axios.get("/api/lasterror")

      if (disposed) return

      if (status !== 200) {
        setTitle(`Error while fetching status (${status}))`)
      } else {
        setTitle("Error fetching latest orders")
      }

      if (Object.keys(data)) {
        setTitle(DEFAULT_TITLE)
        setDetails(DEFAULT_DETAILS)
      } else {
        setDetails(data)
      }
    }

    getData()

    return () => disposed = true
  }, [nextFetchTime])

  return { title, details }
}