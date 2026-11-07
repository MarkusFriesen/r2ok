import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import TakeoutDiningIcon from '@mui/icons-material/TakeoutDining';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import ButtonBase from '@mui/material/ButtonBase';
import useMediaQuery from '@mui/material/useMediaQuery';
import axios from 'axios'
import useItemPlacement, { moveDelayMs } from '../hooks/useItemPlacement';
import './Order.css'

const dateOptions = { month: 'short', day: 'numeric' };
const timeOptions = { hour: 'numeric', minute: 'numeric' };
const language = window.navigator.language;

// To-go cards start glowing once the customer has waited this long
const togoOverdueMs = 15 * 60000;

function getStatusIcon(status) {
  switch (status) {
    case 1:
      return <DoneIcon />
    case 2:
      return <DoneAllIcon />
    default:
      return <RadioButtonUncheckedIcon />
  }
}

function getUrgencyColor(value) {
  if (value >= 85) return "error"
  if (value >= 50) return "warning"
  return "success"
}

function getCircularProgress(value, status, classname, loading) {
  if (status === 2) return <React.Fragment />
  value = value > 100 ? 100 : value
  return <CircularProgress
    color={getUrgencyColor(value)}
    value={Number.parseInt(value)}
    variant={loading ? "indeterminate" : "determinate"}
    size={36}
    thickness={6}
    className={classname} />
}
export default function Order(props) {
  const { name, orders = [], updateOrders, created, togo } = props
  const [changingOrderId, setChaningOrderId] = useState(-1)
  const [now, setNow] = useState(() => Date.now())
  const [showDone, setShowDone] = useState(false)
  const { placementOf, isMoving } = useItemPlacement(orders)
  const transitionMs = useMediaQuery('(prefers-reduced-motion: reduce)') ? 0 : 600

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(intervalId)
  }, [])

  const ToggleStatus = (orderId) => async () => {
    setChaningOrderId(orderId)
    const { status } = await axios.post(`/api/orders/${orderId}/toggleStatus`)
    if (status !== 200) {
      console.error("unable to toggle order", orderId)
      return
    }
    await updateOrders()
    setChaningOrderId(-1)
  }

  const renderItem = (order) => {
    const { name, comment, status, id, created, inFilter, quantity } = order
    let value = 0;

    try {
      const createdAt = new Date(created).getTime();
      value = (((now - createdAt) / 60000 / 45) * 100).toFixed(0)
    } catch (e) {
      console.error("Error creating difference: ", e)
    }

    const labelId = `checkbox-list-label-${id}`;
    return (
      <ListItemButton dense onClick={ToggleStatus(id)} disabled={changingOrderId === id} className={status === 2 ? "order-list-item-padding order-done" : "order-list-item-padding"} >
        <ListItemIcon>
          {getCircularProgress(value, status, "loading", changingOrderId === id)}
          {getStatusIcon(status)}
        </ListItemIcon>
        <ListItemText id={labelId} primary={quantity > 1 ? `${quantity}× ${name}` : name} secondary={comment} />
        <section className={inFilter ? "" : "order-not-in-filter"} />
        {isMoving(order) && (
          <span
            className={status === 2 ? "order-move-progress down" : "order-move-progress up"}
            style={{ animationDuration: `${moveDelayMs}ms` }} />
        )}
      </ListItemButton>
    );
  }

  // Every item is rendered in both sections, collapsing in one while expanding
  // in the other makes it look like it slides from one to the other
  const renderGroup = (section) => (
    <List className="order-group" disablePadding>
      {orders.map(order => (
        <Collapse key={order.id} in={placementOf(order) === section} timeout={transitionMs} unmountOnExit>
          {renderItem(order)}
        </Collapse>
      ))}
    </List>
  )

  const activeCount = orders.filter(o => placementOf(o) === 'active').length
  const doneCount = orders.length - activeCount

  const timestamp = new Date(created)
  const open = orders.some(o => o.status !== 2)
  const overdue = open && now - timestamp.getTime() >= togoOverdueMs
  return (
    <div className="root">
      <Card className={togo ? `card togo${overdue ? " togo-overdue" : ""}` : "card"}>
        <CardHeader
          avatar={
            <Avatar aria-label={togo ? "to-go" : "table"} className="avatar">
              {togo ? <TakeoutDiningIcon /> : <EmojiFoodBeverageIcon />}
            </Avatar>
          }
          title={name}
          subheader={`${timestamp.toLocaleDateString(language, dateOptions)} ${timestamp.toLocaleTimeString(language, timeOptions)}`}
          slotProps={{
            title: { variant: "h6", fontWeight: 700, lineHeight: 1.2 },
            subheader: { className: "timestamp" },
          }}
        />
        <CardContent>
          <Collapse in={activeCount > 0} timeout={transitionMs}>
            {renderGroup('active')}
          </Collapse>
          <Collapse in={doneCount > 0} timeout={transitionMs}>
            <section className="order-done-section">
              <ButtonBase className="order-done-header" onClick={() => setShowDone(!showDone)} aria-expanded={showDone}>
                <DoneAllIcon className="order-done-icon" />
                <span className="order-done-label">Completed</span>
                <span className="order-done-count">{doneCount}</span>
                <ExpandMoreIcon fontSize="small" className={showDone ? "order-done-chevron open" : "order-done-chevron"} />
              </ButtonBase>
              <Collapse in={showDone} timeout={transitionMs}>
                {renderGroup('done')}
              </Collapse>
            </section>
          </Collapse>
        </CardContent>
      </Card>
    </div>

  );
}