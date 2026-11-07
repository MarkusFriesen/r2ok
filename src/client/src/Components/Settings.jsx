import React, { useState } from 'react';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import useTranslation from '../hooks/useTranslation';

// Floating settings button in the top right. The language switcher is always on
// top, a page can add its own settings below it as children
export default function Settings({ badge = false, children }) {
  const { t, language, setLanguage, languages } = useTranslation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <section className="float-right">
      <IconButton className="glass-button" aria-label={t('settings.open')} onClick={() => setOpen(true)}>
        <Badge color="secondary" variant="dot" overlap="rectangular" invisible={!badge}>
          <SettingsIcon />
        </Badge>
      </IconButton>
      <Dialog aria-labelledby="settings-dialog-title" open={open} onClose={close}>
        <DialogTitle id="settings-dialog-title">{t('settings.title')}</DialogTitle>
        <DialogContent>
          <section className="settings-section">
            <Typography variant="h6" id="settings-language-label">{t('settings.language')}</Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              className="language-switcher"
              aria-labelledby="settings-language-label"
              value={language}
              onChange={(_, next) => next && setLanguage(next)}>
              {languages.map(({ code, name }) => (
                <ToggleButton key={code} value={code} lang={code}>{name}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </section>
          {children && <section className="settings-section">{children}</section>}
        </DialogContent>
        <DialogActions>
          <Button onClick={close} color="primary">
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
