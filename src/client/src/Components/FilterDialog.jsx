import React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';

export default function ConfirmationDialog(props) {
  const { onClose, dontShowAll, setDontShowAll, filteredProductGroup, setFilteredProductGroup, open, productGroups } = props;

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
