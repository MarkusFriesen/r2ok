import { useEffect, useState } from "react";
import axios from "axios";
import useTranslation from "./useTranslation";

// Kept untranslated ({ key, params } / raw error), so the text follows a language switch
const NO_ERROR = { title: { key: "errors.none" }, error: null }

// Loads the last synchronization error from the server every time the dialog opens
export default function useErrorMessages(open) {
  const { t, language } = useTranslation()
  const [state, setState] = useState(NO_ERROR)

  useEffect(() => {
    if (!open) return

    let disposed = false
    async function getData() {
      try {
        // { } while the last sync went fine, otherwise { date, code, message, status }
        const { data } = await axios.get("/api/lasterror")
        if (disposed) return

        if (data && Object.keys(data).length > 0) {
          setState({ title: { key: "errors.fetchOrders" }, error: data })
        } else {
          setState(NO_ERROR)
        }
      } catch (error) {
        if (disposed) return

        // axios throws for non-2xx responses, no response at all means the server is down
        const status = error.response?.status
        setState({
          title: status ? { key: "errors.statusFailed", params: { status } } : { key: "errors.unreachable" },
          error: null,
        })
      }
    }

    getData()

    return () => { disposed = true }
  }, [open])

  const { title, error } = state
  let details = t("errors.nextFetch")
  if (error) {
    const time = error.date ? `${new Date(error.date).toLocaleString(language)}: ` : ""
    const status = error.status ? ` (${error.status})` : ""
    details = `${time}${error.message ?? ""}${status}`
  }

  return { title: t(title.key, title.params), details }
}
