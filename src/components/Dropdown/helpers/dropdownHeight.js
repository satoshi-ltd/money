const FLOOR_ROWS = 2;

export const dropdownPlacement = ({
  anchorTop,
  bottomInset = 0,
  count = 0,
  edge = 0,
  itemHeight,
  maxItems,
  offset = 0,
  topInset = 0,
  windowHeight,
}) => {
  const wanted = Math.min(count, maxItems) * itemHeight;
  if (anchorTop === undefined) return { height: wanted, side: 'bottom' };

  // measureInWindow reports inside the content area, so the status bar is not room to grow into.
  const below = windowHeight - topInset - anchorTop - bottomInset - edge;
  const above = anchorTop - offset - edge;
  // It owns a whole window, so it takes whichever side is longer rather than settling for what is under it.
  const side = below < wanted && above > below ? 'top' : 'bottom';
  const room = Math.max(itemHeight * FLOOR_ROWS, side === 'top' ? above : below);
  // Cut on a hairline, never through a row: a half-sliced option reads as a glitch, not as "more below".
  const rows = Math.max(FLOOR_ROWS, Math.floor(Math.min(wanted, room) / itemHeight));

  return { height: rows * itemHeight, side };
};

// measureInWindow reports below the status bar; the modal it lands in spans the whole screen.
export const dropdownOrigin = ({ align, anchor, edge = 0, height, offset = 0, side, topInset = 0, width }) => {
  const top = anchor.top + topInset;
  const left = align === 'right' ? anchor.left + anchor.width - width : anchor.left;

  return { left: Math.max(edge, left), top: side === 'top' ? top - height - offset : top + offset };
};
