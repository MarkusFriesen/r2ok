import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import {red} from '@material-ui/core/colors';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import EmojiFoodBeverageIcon from '@material-ui/icons/EmojiFoodBeverage';
import { post } from 'axios'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 15
  },
  card: {
    width: '100%',
  },
  avatar: {
    backgroundColor: red[500],
  },
}));

const dateOptions = { month: 'long', day: 'numeric'};

export default function Order(props) {
  const classes = useStyles();
  const {tableId, name, orders = {}, updateOrders} = props
  const [changingOrderId, setChaningOrderId] = useState(-1)

  const ToggleMade = (orderId) => async () => {
    setChaningOrderId(orderId)
    const {status} = await post(`/orders/${tableId}/${orderId}/toggleMade`)
    if (status !== 200) {
      console.error("unable to toggle order", orderId)
      return
    }
    await updateOrders()
    setChaningOrderId(-1)
  }

  var items = []
  let timestamp = new Date()
  for (const order in orders) {
    const labelId = `checkbox-list-label-${order}`;
    const {name, comment, made, created} = orders[order]
    const icon = made ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />
    items.push(
      <ListItem key={order} role={undefined} dense button onClick={ToggleMade(order)} disabled={changingOrderId===order}>
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText id={labelId} primary={name} secondary={comment} />
      </ListItem>
    );
    timestamp = new Date(created)
  }

  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <CardHeader
          avatar={
            <Avatar aria-label="table" className={classes.avatar}>
              <EmojiFoodBeverageIcon />
            </Avatar>
          }
          title={name}
          subheader={`${timestamp.toLocaleDateString(undefined, dateOptions)} ${timestamp.toLocaleTimeString()}`}
        />
        <CardContent>
          <List >
            {items}
          </List>
        </CardContent>
      </Card>
    </div>
    
  );
}