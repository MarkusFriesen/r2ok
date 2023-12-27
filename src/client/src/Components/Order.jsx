import React, { useState } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios'
import './Order.css'

const dateOptions = { month: 'short', day: 'numeric' };
const timeOptions = { hour: 'numeric', minute: 'numeric' };
const language = window.navigator.language;

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

function getCircularProgress(value, status, classname, loading) {
  if (status === 2) return <React.Fragment />
  value = value > 100 ? 100 : value
  return <CircularProgress
    color={value > 50 ? "secondary" : "primary"}
    value={Number.parseInt(value)}
    variant={loading ? "indeterminate" : "determinate"}
    size={36}
    thickness={6}
    className={classname} />
}
export default function Order(props) {
  const { name, orders = [], updateOrders, created } = props
  const [changingOrderId, setChaningOrderId] = useState(-1)

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

  const now = new Date().getTime();
  var items = orders.map(order => {
    const { name, comment, status, id, created, inFilter } = order
    let value = 0;

    try {
      const createdAt = new Date(created).getTime();
      value = (((now - createdAt) / 60000 / 45) * 100).toFixed(0)
    } catch (e) {
      console.error("Error creating difference: ", e)
    }

    const labelId = `checkbox-list-label-${id}`;
    return (
      <ListItemButton key={id} dense onClick={ToggleStatus(id)} disabled={changingOrderId === id} className="order-list-item-padding" >
        <ListItemIcon>
          {getCircularProgress(value, status, "loading", changingOrderId === id)}
          {getStatusIcon(status)}
        </ListItemIcon>
        <ListItemText id={labelId} primary={name} secondary={comment} />
        <section className={inFilter ? "" : "order-not-in-filter"} />
      </ListItemButton>
    );
  })

  const timestamp = new Date(created)
  return (
    <div className="root">
      <Card className="card">
        <CardHeader
          avatar={
            <Avatar aria-label="table" className="avatar">
              <EmojiFoodBeverageIcon />
            </Avatar>
          }
          title={name}
          subheader={`${timestamp.toLocaleDateString(language, dateOptions)} ${timestamp.toLocaleTimeString(language, timeOptions)}`}
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