import { useEffect, useRef, useState } from 'react'

const DONE = 2
// Items stay in place for a while after a toggle so a mis-tap can be undone where it happened
export const moveDelayMs = 5000

// Decides whether an item is shown in the open list or in the collapsed
// "completed" section. Items already completed on first sight go there right away.
export default function useItemPlacement(orders) {
  const [placements, setPlacements] = useState({})
  const timers = useRef(new Map())

  const unseen = orders.filter(o => !placements[o.id])
  if (unseen.length > 0) {
    setPlacements(unseen.reduce((p, o) => ({ ...p, [o.id]: targetOf(o) }), placements))
  }

  useEffect(() => {
    const pending = timers.current

    for (const order of orders) {
      const { id } = order
      const target = targetOf(order)
      const placement = placements[id]
      if (!placement) continue

      const timer = pending.get(id)
      if (placement === target) {
        // Toggled back before the move happened, stay where it is
        if (timer) {
          clearTimeout(timer)
          pending.delete(id)
        }
        continue
      }

      if (timer) continue
      pending.set(id, setTimeout(() => {
        pending.delete(id)
        setPlacements(p => ({ ...p, [id]: target }))
      }, moveDelayMs))
    }
  }, [orders, placements])

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach(clearTimeout)
      pending.clear()
    }
  }, [])

  const placementOf = (order) => placements[order.id] ?? targetOf(order)
  // Toggled but not moved yet, the timer above is running
  const isMoving = (order) => placementOf(order) !== targetOf(order)

  return { placementOf, isMoving }
}

const targetOf = ({ status }) => status === DONE ? 'done' : 'active'
