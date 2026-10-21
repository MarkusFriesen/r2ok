import React, { useLayoutEffect, useRef, useState } from 'react';

// Highlight that slides behind the selected child of a ToggleButtonGroup.
// Spread `groupProps` on the group and render `indicator` as its first child.
// `selected` is the current value; it re-measures whenever it changes.
export default function useSlidingIndicator(selected) {
  const ref = useRef(null);
  const [box, setBox] = useState(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current?.querySelector('.Mui-selected');
      setBox(el && { left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selected]);

  const groupProps = {
    ref,
    sx: {
      position: 'relative',
      '& .MuiToggleButton-root': { zIndex: 1 },
      '& .Mui-selected, & .Mui-selected:hover': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
    },
  };

  const indicator = box && (
    <span
      className="nav-indicator"
      style={{ width: box.width, transform: `translateX(${box.left}px)` }}
    />
  );

  return [groupProps, indicator];
}
