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
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import EmojiFoodBeverageIcon from '@material-ui/icons/EmojiFoodBeverage';
import CircularProgress from '@material-ui/core/CircularProgress';
import {post} from 'axios'

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
  loading: {
    position: "absolute",
    transform: "translate(-16%, -16%) !important",
  }
}));

const dateOptions = {month: 'short', day: 'numeric'};
const timeOptions = {hour: 'numeric', minute: 'numeric'};
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
    value={value}
    variant={loading ? "indeterminate" : "determinate"}
    size={36}
    thickness={6}
    className={classname} />
}
export default function Order(props) {
  const classes = useStyles();
  const {name, orders = [], updateOrders, created} = props
  const [changingOrderId, setChaningOrderId] = useState(-1)

  const ToggleStatus = (orderId) => async () => {
    setChaningOrderId(orderId)
    const {status} = await post(`/orders/${orderId}/toggleStatus`)
    if (status !== 200) {
      console.error("unable to toggle order", orderId)
      return
    }
    await updateOrders()
    setChaningOrderId(-1)
  }

  const now = new Date();
  var items = orders.map(order => {
    const {name, comment, status, id, created} = order
    let value = 0;

    try {
      const createdAt = new Date(created);
      value = (((now - createdAt) / 60000 / 30) * 100).toFixed(0)
    } catch (e) {
      console.error("Error creating difference: ", e)
    }

    const labelId = `checkbox-list-label-${id}`;
    return (
      <ListItem key={id} role={undefined} dense button onClick={ToggleStatus(id)} disabled={changingOrderId === id}>
        <ListItemIcon>
          {getCircularProgress(value, status, classes.loading, changingOrderId === id)}
          {getStatusIcon(status)}
        </ListItemIcon>
        <ListItemText id={labelId} primary={name} secondary={comment} />
      </ListItem>
    );
  })

  const timestamp = new Date(created)
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
          subheader={`${timestamp.toLocaleDateString(language, dateOptions)} ${timestamp.toLocaleTimeString(language, timeOptions)}`}
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