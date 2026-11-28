import {useState,useEffect} from 'react'
import {Link} from 'react-router-dom'
import api from '../api/axios.js'
import './workspace.css'
export default function ResumeAnalysis(){
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeResult, setResumeResult] = useState(null)
  const [resumeLoading, setResumeLoading] = useState(true)
  const [resumeError, setResumeError] = useState('')
  const [resumeRetry, setResumeRetry] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    let cancelled = false
    setResumeLoading(true); setResumeError('')
    api.get('/resume/me')
      .then(res => { if (!cancelled && res.status === 200 && res.data) setResumeResult(res.data) })
      .catch(err => { if (!cancelled) setResumeError(err.response?.data?.error || 'Could not retrieve your saved resume. Please retry.') })
      .finally(() => { if (!cancelled) setResumeLoading(false) })
    return () => { cancelled = true }
  }, [resumeRetry])

  async function handleUpload(e) {
    e.preventDefault()
    if (!resumeFile) return
    setUploading(true); setResumeError('')
    const fd = new FormData()
    fd.append('file', resumeFile)
    try {
      const res = await api.post('/resume/upload', fd)
      setResumeResult(res.data); setResumeFile(null)
    } catch (err) { setResumeError(err.response?.data?.error || 'Upload failed') }
    finally { setUploading(false) }
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type === 'application/pdf') setResumeFile(f); else setResumeError('Resume must be a PDF')
  }

return <div className="v64-page"><div className="v64-heading"><span>PERSONALISED PREPARATION</span><h1>Make your resume work for you.</h1><p>Upload your resume to extract skills and projects for more relevant interview questions.</p></div><div className="v64-two"><section className="v64-panel v64-resume">        <div className="right-card resume-card" id="resume">
          <span className="plus-mark">▤</span>
          <h3>Resume analysis</h3>
          <p>Personalize your interview with your skills.</p>
          {resumeResult && <div className="resume-saved">✓ Resume analysis saved{resumeResult.uploadedAt ? ` · ${new Date(resumeResult.uploadedAt).toLocaleDateString()}` : ''}</div>}
          {resumeError && <div role="alert" className="resume-error">{resumeError}<button type="button" onClick={() => setResumeRetry(n => n + 1)}>Retry loading</button></div>}
          <form onSubmit={handleUpload}>
            <label className={'file-picker drop ' + (dragging ? 'over' : '')} onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
              {resumeFile?.name || 'Drop a PDF or browse'}
              <input type="file" accept="application/pdf" onChange={e => setResumeFile(e.target.files[0])} />
            </label>
            <button className="btn-primary" disabled={!resumeFile || uploading}>{uploading ? 'Analysing…' : resumeResult ? 'Replace resume' : 'Upload resume'}</button>
          </form>
          {resumeLoading ? <small>Checking saved resume…</small> : resumeResult ? (
            <div className="skills-list">
              {(resumeResult.skillsFound || []).map(s => <span key={s}>{s}</span>)}
              {!resumeResult.skillsFound?.length && <small>No skills detected.</small>}
              {resumeResult.projectsSummary && <details className="resume-projects"><summary>Extracted project details</summary><p>{resumeResult.projectsSummary}</p></details>}
            </div>
          ) : null}
        </div>

</section><section className="v64-panel"><h2>How it works</h2><ol className="v64-steps"><li><b>Upload your PDF</b><p>Use your current placement resume.</p></li><li><b>Review extracted information</b><p>Check the detected skills and project details.</p></li><li><b>Practise your experience</b><p>Prepare to explain your contributions, technical choices and challenges.</p></li></ol><Link className="btn-primary" to="/new-interview">Configure interview →</Link></section></div></div>}
