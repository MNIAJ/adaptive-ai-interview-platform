// Local, custom company marks; no external image requests.
const BRANDS = {
  'tcs ninja': ['#e9edf3','#475569','ninja'],
  'tcs digital': ['#e8efff','#2563eb','cpu'],
  'tcs prime': ['#fff3d9','#a16207','crown'],
  'tcs': ['#e8efff','#2563eb','cpu'],
  'hcltech': ['#eaeaff','#4338ca','layers'],
  'infosys': ['#e3f4ff','#0369a1','bulb'],
  'cognizant': ['#e0f4f8','#0e7490','brain'],
  'connecticus': ['#dff5ee','#0f7a62','nodes'],
  'centiro': ['#e0f2fe','#0369a1','supply'],
  'algoquant': ['#f0e6ff','#6d3fb0','candles'],
}

function Mark({ type, color }) {
  const p = { width: '62%', height: '62%', viewBox: '0 0 32 32', fill: 'none', stroke: color, strokeWidth: 2.2, strokeLinecap: 'round' }
  if (type === 'supply') return <svg {...p}><rect x="11" y="10" width="10" height="12" rx="2"/><path d="M11 14H5V7h6m10 7h6v11h-6M16 10V4m0 18v6"/><circle cx="5" cy="7" r="2" fill={color}/><circle cx="27" cy="25" r="2" fill={color}/><path d="M11 14l5 3 5-3m-5 3v5"/></svg>
  if (type === 'nodes') return <svg {...p}><path d="M8 9l8 7-8 7M16 16h9"/><circle cx="8" cy="9" r="2.6" fill={color}/><circle cx="8" cy="23" r="2.6" fill={color}/><circle cx="25" cy="16" r="2.6" fill={color}/></svg>
  if (type === 'candles') return <svg {...p}><path d="M8 5v22M16 9v16M24 4v20"/><rect x="5.5" y="11" width="5" height="9" rx="1.2" fill={color}/><rect x="13.5" y="13" width="5" height="7" rx="1.2" fill="none"/><rect x="21.5" y="8" width="5" height="10" rx="1.2" fill={color}/></svg>
  if (type === 'ninja') return <svg {...p} stroke="none"><path fill={color} d="M23 8c3-3 6-3 8-2l-4 4 4 2c-3 2-6 1-8-1z"/><path fill={color} d="M16 2C8 2 3 8 3 16s5 14 13 14 13-6 13-14S24 2 16 2Z"/><path fill="#e9edf3" d="M6 12c6-2 14-2 20 0v6c-6 2-14 2-20 0z"/><path stroke={color} strokeWidth="1.8" d="m9 13 5 2m9-2-5 2"/><circle cx="12" cy="16" r="1.4" fill={color}/><circle cx="20" cy="16" r="1.4" fill={color}/></svg>
  if (type === 'cpu') return <svg {...p}><rect x="8" y="8" width="16" height="16" rx="3"/><rect x="13" y="13" width="6" height="6"/><path d="M12 4v4m8-4v4M12 24v4m8-4v4M4 12h4m-4 8h4m16-8h4m-4 8h4"/></svg>
  if (type === 'crown') return <svg {...p}><path d="M4 9l6 6 6-10 6 10 6-6-3 15H7zM8 28h16"/></svg>
  if (type === 'layers') return <svg {...p}><path d="M16 4l12 7-12 7-12-7zM4 17l12 7 12-7M4 23l12 7 12-7"/></svg>
  if (type === 'bulb') return <svg {...p}><path d="M11 22v-3a9 9 0 1 1 10 0v3zM12 26h8m-6 3h4M16 22v-8"/></svg>
  if (type === 'brain') return <svg {...p}><path d="M16 7C10 1 4 8 7 13c-6 4-3 12 2 12 0 5 7 5 7 0V7zm0 0c6-6 12 1 9 6 6 4 3 12-2 12 0 5-7 5-7 0M7 13l5 3m13-3-5 3M9 25l3-5m11 5-3-5"/></svg>
  return null
}

function hue(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h }

export default function CompanyLogo({ name = '', size = 49 }) {
  const label = String(name || '').trim();
  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const compact = key.replace(/ /g, '');
  const match = Object.keys(BRANDS).find(k => compact === k.replace(/ /g, '')) || Object.keys(BRANDS).find(k => key.startsWith(k + ' '));
  const [tint, ink, mark] = BRANDS[match] || [`hsl(${hue(key)} 70% 93%)`, `hsl(${hue(key)} 55% 32%)`, null];
  return <span className="company-logo" style={{ background: tint, color: ink, width: size, height: size, fontSize: size * 0.3 }} role="img" aria-label={`${label || 'Company'} icon`}>
    {mark ? <Mark type={mark} color={ink} /> : <span>{label.slice(0, 2).toUpperCase() || 'AI'}</span>}
  </span>;
}
