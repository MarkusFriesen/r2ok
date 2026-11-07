import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import useTranslation from '../hooks/useTranslation';

// Order filters, shown as a section of the settings dialog
export default function FilterSettings(props) {
  const { dontShowAll, setDontShowAll, filteredProductGroup, setFilteredProductGroup, productGroups } = props;
  const { t } = useTranslation();

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
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={dontShowAll}
            onChange={handleChange(setDontShowAll)}
            name="showAll"
          />
        }
        label={t('settings.hideFulfilled')}
      />
      <br />
      <Typography variant='h6'>{t('settings.productGroups')}</Typography>
      {productGroupsCheckboxes}
    </>
  );
}
