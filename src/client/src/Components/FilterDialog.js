import React from 'react';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {Typography} from '@material-ui/core';

export default function ConfirmationDialog(props) {
  const {onClose, dontShowAll, setDontShowAll, filteredProductGroup, setFilteredProductGroup, open, productGroups} = props;

  const handleOk = () => {
    onClose();
  };

  const handleChange = setter => (event) => {
    setter(event.target.checked);
  };

  const handleProductGroup = groupId => (event) => {
    const newFilteredProductGroup = filteredProductGroup.filter(f => f !== groupId)
    if (event.target.checked) {
      newFilteredProductGroup.push(groupId)
    }
    setFilteredProductGroup(newFilteredProductGroup)
  }

  const productGroupsCheckboxes = []

  for (const group in productGroups) {
    productGroupsCheckboxes.push(<div key={group}>
      <br />
      <FormControlLabel control={
        <Checkbox
          checked={filteredProductGroup.includes(group)}
          name={productGroups[group]}
          onChange={handleProductGroup(group)} />
      }
        label={productGroups[group]} />
    </div>)
  }

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
              checked={dontShowAll}
              onChange={handleChange(setDontShowAll)}
              name="showAll"
            />
          }
          label="Don't show fulfilled orders"
        />
        <br />
        <Typography variant='h6'> Produt groups</Typography>
        {productGroupsCheckboxes}

      </DialogContent>
      <DialogActions>
        <Button onClick={handleOk} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
