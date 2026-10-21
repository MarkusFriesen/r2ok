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
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios'
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

  const items = orders.map(order => {
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
      <ListItemButton key={id} dense onClick={ToggleStatus(id)} disabled={changingOrderId === id} className={status === 2 ? "order-list-item-padding order-done" : "order-list-item-padding"} >
        <ListItemIcon>
          {getCircularProgress(value, status, "loading", changingOrderId === id)}
          {getStatusIcon(status)}
        </ListItemIcon>
        <ListItemText id={labelId} primary={quantity > 1 ? `${quantity}× ${name}` : name} secondary={comment} />
        <section className={inFilter ? "" : "order-not-in-filter"} />
      </ListItemButton>
    );
  })

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
          <List className="order-list">
            {items}
          </List>
        </CardContent>
      </Card>
    </div>

  );
}