import React from 'react';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

export default function ConfirmationDialog(props) {
  const {onClose, showAll, setShowAll, showDrinks, setShowDrinks, showFood, setShowFood, open} = props;

  const handleOk = () => {
    onClose();
  };

  const handleChange = setter => (event) => {
    setter(event.target.checked);
  };

  return (
    <Dialog
      aria-labelledby="confirmation-dialog-title"
      open={open}
      onClose={onClose}
    >
      <DialogTitle id="confirmation-dialog-title">Filter</DialogTitle>
      <DialogContent >
        <FormControlLabel
          control={
            <Checkbox
              checked={showAll}
              onChange={handleChange(setShowAll)}
              name="showAll"
            />
          }
          label="Show fulfilled orders"
        />
        <br/>
        <FormControlLabel
          control={
            <Checkbox
              checked={showDrinks}
              onChange={handleChange(setShowDrinks)}
              name="Show drinks"
            />
          }
          label="Show drinks"
        />
        <br />
        <FormControlLabel
          control={
            <Checkbox
              checked={showFood}
              onChange={handleChange(setShowFood)}
              name="Show food"
            />
          }
          label="Show food"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOk} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
