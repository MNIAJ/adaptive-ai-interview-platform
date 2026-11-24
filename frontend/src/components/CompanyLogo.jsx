import { useState } from 'react'

// [domain, initials, tint, ink, custom mark]. Marks are inline SVG, so they never fail to load.
const BRANDS = {
  TCS:         ['tcs.com',       'TCS', '#e9eeff', '#263f91'],
  Infosys:     ['infosys.com',   'IN',  '#e3f4ff', '#0074b9'],
  HCLTech:     ['hcltech.com',   'HCL', '#e8edff', '#233eab'],
  Cognizant:   ['cognizant.com', 'C',   '#e8e9ff', '#292e91'],
  Connecticus: [null,            'CO',  '#dff5ee', '#0f7a62', 'nodes'],
  AlgoQuant:   [null,            'AQ',  '#f0e6ff', '#6d3fb0', 'candles'],
}

// Tried in order. Google returns a 16px globe when it has no icon, so tiny images count as a miss.
const sources = d => [
  `https://www.google.com/s2/favicons?domain=${d}&sz=128`,
  `https://icons.duckduckgo.com/ip3/${d}.ico`,
]

function Mark({ type, color }) {
  const p = { width: '62%', height: '62%', viewBox: '0 0 32 32', fill: 'none', stroke: color, strokeWidth: 2.2, strokeLinecap: 'round' }
  if (type === 'nodes') return <svg {...p}><path d="M8 9l8 7-8 7M16 16h9"/><circle cx="8" cy="9" r="2.6" fill={color}/><circle cx="8" cy="23" r="2.6" fill={color}/><circle cx="25" cy="16" r="2.6" fill={color}/></svg>
  if (type === 'candles') return <svg {...p}><path d="M8 5v22M16 9v16M24 4v20"/><rect x="5.5" y="11" width="5" height="9" rx="1.2" fill={color}/><rect x="13.5" y="13" width="5" height="7" rx="1.2" fill="none"/><rect x="21.5" y="8" width="5" height="10" rx="1.2" fill={color}/></svg>
  return null
}

// Unknown companies get a deterministic gradient monogram instead of a blank tile.
function hue(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h }

export default function CompanyLogo({ name = '', size = 49 }) {
  const key = name.startsWith('TCS') ? 'TCS' : name
  const [domain, initials, tint, ink, mark] = BRANDS[key] || [null, name.slice(0, 2).toUpperCase() || 'AI', `hsl(${hue(name)} 70% 93%)`, `hsl(${hue(name)} 55% 32%)`]
  const [step, setStep] = useState(0)
  const list = domain ? sources(domain) : []
  const src = list[step]
  const miss = () => setStep(s => s + 1)

  return (
    <span className="company-logo" style={{ background: tint, color: ink, width: size, height: size, fontSize: size * 0.3 }} role="img" aria-label={`${key} logo`}>
      {src
        ? <img key={src} src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={miss} onLoad={e => e.currentTarget.naturalWidth <= 16 && miss()} />
        : mark ? <Mark type={mark} color={ink} /> : <span>{initials}</span>}
    </span>
  )
}
