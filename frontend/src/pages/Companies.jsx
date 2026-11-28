import {Link} from 'react-router-dom'
import {COMPANIES} from './Dashboard.jsx'
import CompanyLogo from '../components/CompanyLogo.jsx'
import './workspace.css'
export default function Companies(){return <div className="v64-page"><div className="v64-heading"><span>COMPANY DIRECTORY</span><h1>Explore your target companies</h1><p>Choose a company profile to start tailored practice.</p></div><div className="v64-company-grid">{COMPANIES.map(c=><article className="v64-panel" key={c.name}><CompanyLogo name={c.name} size={52}/><h2>{c.name}</h2><p>{c.topics}</p><small>{({LOW:'Foundation',MEDIUM:'Intermediate',HIGH:'Advanced'})[c.difficulty]}</small><Link className="btn-ghost" to={'/new-interview?company='+encodeURIComponent(c.name)}>Practise →</Link></article>)}</div></div>}
