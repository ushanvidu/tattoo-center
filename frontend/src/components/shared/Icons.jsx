const I = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}
    strokeLinecap="round" strokeLinejoin="round" {...p} />
);

export const Icons = {
  menu:    (p) => <I {...p}><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></I>,
  close:   (p) => <I {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></I>,
  cart:    (p) => <I {...p}><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2.2l2.3 12.3a2 2 0 0 0 2 1.7h8.4a2 2 0 0 0 2-1.6l1.4-7.4H6"/></I>,
  search:  (p) => <I {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></I>,
  filter:  (p) => <I {...p}><path d="M3 5h18"/><path d="M6 12h12"/><path d="M10 19h4"/></I>,
  star:    ({ filled, ...p }) => <I {...p} fill={filled ? 'currentColor' : 'none'}><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/></I>,
  play:    (p) => <I {...p} fill="currentColor" stroke="none"><path d="M7 5v14l12-7z"/></I>,
  upload:  (p) => <I {...p}><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></I>,
  mirror:  (p) => <I {...p}><path d="M12 3v18"/><path d="M6 8 3 12l3 4"/><path d="m18 8 3 4-3 4"/></I>,
  arrow:   (p) => <I {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></I>,
  arrowUR: (p) => <I {...p}><path d="M7 17 17 7"/><path d="M8 7h9v9"/></I>,
  chevD:   (p) => <I {...p}><path d="m6 9 6 6 6-6"/></I>,
  plus:    (p) => <I {...p}><path d="M12 5v14"/><path d="M5 12h14"/></I>,
  minus:   (p) => <I {...p}><path d="M5 12h14"/></I>,
  check:   (p) => <I {...p}><path d="M4 12.5 9 17.5 20 6.5"/></I>,
  bolt:    (p) => <I {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></I>,
  shield:  (p) => <I {...p}><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"/><path d="m9 12 2 2 4-4"/></I>,
  truck:   (p) => <I {...p}><path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></I>,
  layers:  (p) => <I {...p}><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/></I>,
  compare: (p) => <I {...p}><path d="M12 3v18"/><path d="M5 8h4M5 12h4M5 16h4"/><path d="M15 8h4M15 12h4M15 16h4"/></I>,
  eye:     (p) => <I {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></I>,
  printer: (p) => <I {...p}><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/></I>,
  machine: (p) => <I {...p}><rect x="7" y="3" width="10" height="8" rx="2"/><path d="M12 11v4"/><path d="M9 21h6"/><path d="M12 15l-1 6h2z"/></I>,
  needle:  (p) => <I {...p}><path d="M20 4 9 15"/><path d="m4 20 5-5"/><path d="M14 4h6v6"/><path d="m9 15-1.5 1.5"/></I>,
  ink:     (p) => <I {...p}><path d="M9 3h6v3l1 2v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8l1-2z"/><path d="M8 12h8"/></I>,
  paper:   (p) => <I {...p}><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4"/><path d="M9 13h6M9 17h6"/></I>,
  cream:   (p) => <I {...p}><path d="M8 8h8v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z"/><path d="M10 8V5h4v3"/><path d="M9 12h6"/></I>,
  soap:    (p) => <I {...p}><rect x="5" y="9" width="14" height="11" rx="3"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></I>,
  heart:   (p) => <I {...p}><path d="M12 20s-7-4.3-9.3-8.2C1 9 2.3 5.5 5.5 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.2 0 4.5 3.5 2.8 6.3C19 15.7 12 20 12 20z"/></I>,
  glove:   (p) => <I {...p}><path d="M7 11V5a1.5 1.5 0 0 1 3 0v5m0 0V4a1.5 1.5 0 0 1 3 0v6m0 0V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a5 5 0 0 1-5-5v-2l-1.3-1.3a1.4 1.4 0 0 1 2-2L7 11z"/></I>,
  sparkle: (p) => <I {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="M12 8l1.2 2.8L16 12l-2.8 1.2L12 16l-1.2-2.8L8 12l2.8-1.2z"/></I>,
  pin:     (p) => <I {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></I>,
  mail:    (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></I>,
  phone:   (p) => <I {...p}><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 11l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></I>,
  cal:     (p) => <I {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></I>,
  drop:    (p) => <I {...p}><path d="M12 3s6 6.4 6 10.5a6 6 0 0 1-12 0C6 9.4 12 3 12 3z"/></I>,
  grid:    (p) => <I {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></I>,
  flask:   (p) => <I {...p}><path d="M9 3h6M10 3v6l-5 9a1.5 1.5 0 0 0 1.3 2.2h11.4A1.5 1.5 0 0 0 19 18l-5-9V3"/><path d="M7.5 15h9"/></I>,
  user:    (p) => <I {...p}><circle cx="12" cy="7" r="4"/><path d="M4 20v-1a8 8 0 0 1 16 0v1"/></I>,
  logout:  (p) => <I {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></I>,
  payhere: (p) => <I {...p}><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></I>,
  wa: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M.06 24l1.68-6.13A11.86 11.86 0 0 1 .14 11.9C.14 5.33 5.5 0 12.06 0a11.82 11.82 0 0 1 8.4 3.48 11.74 11.74 0 0 1 3.48 8.4c0 6.55-5.36 11.88-11.92 11.88a12 12 0 0 1-5.7-1.45L.06 24zM6.6 20.2l.36.21a9.86 9.86 0 0 0 5.02 1.37 9.88 9.88 0 0 0 9.9-9.86 9.82 9.82 0 0 0-2.9-7A9.78 9.78 0 0 0 12.07 2 9.88 9.88 0 0 0 2.16 11.9a9.8 9.8 0 0 0 1.5 5.25l.24.38-1 3.63 3.7-.96zM18 14.3c-.07-.12-.27-.2-.57-.34-.3-.15-1.77-.88-2.04-.98-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07a8.1 8.1 0 0 1-2.4-1.48 9 9 0 0 1-1.66-2.06c-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.07 4.49.71.3 1.26.49 1.69.63.71.22 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.24-.7.24-1.3.17-1.42z"/>
    </svg>
  ),
};

export default Icons;
