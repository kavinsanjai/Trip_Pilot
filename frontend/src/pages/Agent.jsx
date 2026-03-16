import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '../components/Navbar'

// ─── Phase badge colors ──────────────────────────────────────
const PHASE_META = {
  planning:    { label: 'Planning',    color: 'bg-purple-500' },
  researching: { label: 'Researching', color: 'bg-blue-500' },
  optimizing:  { label: 'Optimizing',  color: 'bg-amber-500' },
  generating:  { label: 'Generating',  color: 'bg-green-500' },
  done:        { label: 'Done',        color: 'bg-emerald-500' },
}

const Agent = ({ user }) => {
  const wsRef = useRef(null)
  const logEndRef = useRef(null)

  const [goal, setGoal] = useState('')
  const [status, setStatus] = useState('Idle')
  const [screenshot, setScreenshot] = useState(null)
  const [connected, setConnected] = useState(false)
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState([])

  // New multi-phase state
  const [phase, setPhase] = useState(null)        // current phase key
  const [taskPlan, setTaskPlan] = useState(null)   // { tasks, constraints }
  const [taskStatus, setTaskStatus] = useState({}) // taskId → { status, findings }
  const [collectedData, setCollectedData] = useState([]) // all extracted items
  const [optimized, setOptimized] = useState(null) // optimization result
  const [travelPlan, setTravelPlan] = useState(null) // final plan JSON

  // User interaction state
  const [userInput, setUserInput] = useState('')    // text to type into browser
  const [clickMarker, setClickMarker] = useState(null) // {x,y} for visual feedback
  const imgRef = useRef(null)

  // CAPTCHA state
  const [captchaActive, setCaptchaActive] = useState(false)
  const [captchaText, setCaptchaText] = useState('')

  // Rate-limit state
  const [rateLimitMsg, setRateLimitMsg] = useState(null)

  // ─── WebSocket setup ────────────────────────────────────
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000')
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)

        switch (msg.type) {
          /* ── Existing ── */
          case 'SCREENSHOT':
            setScreenshot(`data:image/jpeg;base64,${msg.data}`)
            break
          case 'REASONING':
            setStatus(msg.text)
            setLog((p) => [...p, msg.text])
            break
          case 'STATUS':
            setStatus(msg.text)
            break
          case 'RATE_LIMIT':
            setStatus(msg.text)
            setRateLimitMsg(msg.text)
            setLog((p) => [...p, `⏳ ${msg.text}`])
            // Auto-clear once the wait is over
            if (msg.waitSec) setTimeout(() => setRateLimitMsg(null), msg.waitSec * 1000)
            break
          case 'ERROR':
            setStatus(`Error: ${msg.text}`)
            setRunning(false)
            break

          /* ── Phase tracking ── */
          case 'PHASE':
            setPhase(msg.phase)
            setStatus(msg.text)
            setLog((p) => [...p, `── ${msg.text} ──`])
            break

          /* ── Task decomposition ── */
          case 'PLAN':
            setTaskPlan({ tasks: msg.tasks, constraints: msg.constraints })
            setLog((p) => [...p, `📋 Plan: ${msg.tasks.length} tasks created`])
            break

          /* ── Per-task updates ── */
          case 'TASK_START':
            setTaskStatus((prev) => ({
              ...prev,
              [msg.taskId]: { status: 'running', description: msg.description, category: msg.category, findings: 0 },
            }))
            setLog((p) => [...p, `▶ Task ${msg.taskId}: ${msg.description}`])
            break
          case 'TASK_STATUS':
            setStatus(msg.text)
            setLog((p) => [...p, msg.text])
            break
          case 'TASK_COMPLETE':
            setTaskStatus((prev) => ({
              ...prev,
              [msg.taskId]: { ...prev[msg.taskId], status: 'done', findings: msg.findingsCount },
            }))
            setLog((p) => [...p, `✅ Task ${msg.taskId} complete (${msg.findingsCount} items found)`])
            break

          /* ── Data collection ── */
          case 'DATA_COLLECTED':
            if (msg.latest) {
              setCollectedData((prev) => [...prev, ...msg.latest])
            }
            setLog((p) => [...p, `📦 Extracted ${msg.latest?.length || 0} items (total: ${msg.count})`])
            break

          /* ── Optimization ── */
          case 'OPTIMIZED':
            setOptimized(msg.data)
            setLog((p) => [...p, '⚡ Optimization complete'])
            break

          /* ── Final plan ── */
          case 'TRAVEL_PLAN':
            setTravelPlan(msg.plan)
            setLog((p) => [...p, `🗺️ Travel plan generated: ${msg.plan?.title || ''}`])
            break

          case 'CAPTCHA':
            setCaptchaActive(true)
            setCaptchaText(msg.text)
            setStatus('⚠️ CAPTCHA — waiting for you to solve it…')
            setLog((p) => [...p, `⚠️ CAPTCHA detected`])
            break
          case 'CAPTCHA_CLEARED':
            setCaptchaActive(false)
            setCaptchaText('')
            setStatus(msg.text)
            setLog((p) => [...p, `✅ ${msg.text}`])
            break

          case 'DONE':
            setPhase('done')
            setStatus('Done')
            setRunning(false)
            setCaptchaActive(false)
            setLog((p) => [...p, `✅ ${msg.summary}`])
            break

          default:
            break
        }
      } catch (err) {
        console.error('Failed to parse WS message:', err)
      }
    }

    ws.onclose = () => { setConnected(false); setRunning(false) }
    ws.onerror = () => { setConnected(false) }
    return () => ws.close()
  }, [])

  // ─── Actions ────────────────────────────────────────────
  const handleStart = () => {
    if (!goal.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'START_AGENT', goal }))
    setRunning(true)
    setStatus('Starting agent…')
    setPhase(null)
    setTaskPlan(null)
    setTaskStatus({})
    setCollectedData([])
    setOptimized(null)
    setTravelPlan(null)
    setScreenshot(null)
    setCaptchaActive(false)
    setRateLimitMsg(null)
    setLog([])
  }

  const handleStop = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'STOP_AGENT' }))
    setStatus('Stopping…')
  }

  // ─── User Interaction Helpers ──────────────────────────
  const wsSend = useCallback((obj) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(obj))
    }
  }, [])

  // Click on screenshot → forward to browser at scaled coordinates
  const handleScreenshotClick = useCallback((e) => {
    const img = imgRef.current
    if (!img) return
    const rect = img.getBoundingClientRect()
    // Map displayed coords to 1280×720 viewport
    const x = Math.round((e.clientX - rect.left) / rect.width * 1280)
    const y = Math.round((e.clientY - rect.top) / rect.height * 720)
    wsSend({ type: 'USER_CLICK', x, y })
    // Visual click marker
    setClickMarker({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setTimeout(() => setClickMarker(null), 600)
    // Request fresh screenshot after a short delay
    setTimeout(() => wsSend({ type: 'USER_SCREENSHOT' }), 1500)
  }, [wsSend])

  const handleUserType = useCallback(() => {
    if (!userInput.trim()) return
    wsSend({ type: 'USER_TYPE', text: userInput })
    setUserInput('')
    setTimeout(() => wsSend({ type: 'USER_SCREENSHOT' }), 1000)
  }, [userInput, wsSend])

  const handleUserKey = useCallback((key) => {
    wsSend({ type: 'USER_KEY', key })
    setTimeout(() => wsSend({ type: 'USER_SCREENSHOT' }), 1500)
  }, [wsSend])

  const handleUserScroll = useCallback((direction) => {
    wsSend({ type: 'USER_SCROLL', direction })
    setTimeout(() => wsSend({ type: 'USER_SCREENSHOT' }), 1000)
  }, [wsSend])

  const handleUserBack = useCallback(() => {
    wsSend({ type: 'USER_BACK' })
    setTimeout(() => wsSend({ type: 'USER_SCREENSHOT' }), 2000)
  }, [wsSend])

  // Auto-scroll log
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [log])

  // ─── Derived helpers ────────────────────────────────────
  const phaseMeta = PHASE_META[phase] || null
  const canInteract = connected && screenshot

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen grid-background flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1 overflow-hidden">
        {/* ━━ Left Sidebar ━━ */}
        <aside className="w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200 shadow-lg flex flex-col p-5 gap-5 shrink-0 overflow-y-auto">
          {/* Connection */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-700 font-medium">{connected ? 'Connected' : 'Disconnected'}</span>
            {phaseMeta && (
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full text-white ${phaseMeta.color}`}>
                {phaseMeta.label}
              </span>
            )}
          </div>

          {/* Goal */}
          <div className="flex flex-col gap-2">
            <label htmlFor="goal" className="text-sm font-semibold text-gray-700">Travel Goal</label>
            <textarea
              id="goal" rows={3}
              className="bg-white border-2 border-gray-300 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder='e.g. "Plan a 5-day trip to Tokyo under $2000 in March"'
              value={goal} onChange={(e) => setGoal(e.target.value)} disabled={running}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button onClick={handleStart} disabled={!connected || running || !goal.trim()}
              className="flex-1 bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-full transition-all shadow-md hover:shadow-lg text-sm">
              {running ? 'Running…' : 'Start Agent'}
            </button>
            {running && (
              <button onClick={handleStop}
                className="px-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-full transition-all shadow-md hover:shadow-lg text-sm">
                Stop
              </button>
            )}
          </div>

          {/* Status */}
          {/* Status */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">🔔 Current Status</h3>
            <div className="bg-gradient-to-r from-accent-mint/20 to-accent-blue/20 border-2 border-accent-mint/40 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-sm font-medium text-gray-800 leading-relaxed">{status}</p>
            </div>
          </div>

          {/* Task Plan */}
          {taskPlan && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">📋 Research Tasks</h3>
              <div className="space-y-2">
                {taskPlan.tasks.map((t) => {
                  const ts = taskStatus[t.id]
                  const getStatusInfo = () => {
                    if (ts?.status === 'done') return { icon: '✅', color: 'bg-green-50 border-green-300', text: 'text-green-700' }
                    if (ts?.status === 'running') return { icon: '🔄', color: 'bg-blue-50 border-blue-300', text: 'text-blue-700' }
                    return { icon: '⬜', color: 'bg-gray-50 border-gray-300', text: 'text-gray-600' }
                  }
                  const statusInfo = getStatusInfo()
                  
                  return (
                    <div key={t.id} className={`${statusInfo.color} border-2 rounded-xl px-3 py-2.5 shadow-sm transition-all`}>
                      <div className="flex items-start gap-2">
                        <span className="text-base mt-0.5">{statusInfo.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wide ${statusInfo.text}`}>
                              {t.category}
                            </span>
                            {ts?.findings > 0 && (
                              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-semibold">
                                {ts.findings} found
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">{t.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {taskPlan.constraints?.budget && (
                <div className="mt-3 bg-accent-coral/10 border border-accent-coral/30 rounded-lg px-3 py-2">
                  <p className="text-xs font-semibold text-accent-coral">💰 Budget Constraint: {taskPlan.constraints.budget}</p>
                </div>
              )}
            </div>
          )}

          {/* Log */}
          {log.length > 0 && (
            <div className="flex-1 min-h-0">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">📜 Activity Log</h3>
              <div className="bg-gray-900 border-2 border-gray-700 rounded-xl px-4 py-3 overflow-y-auto max-h-40 shadow-inner">
                <div className="space-y-1 font-mono text-xs">
                  {log.map((entry, i) => (
                    <p key={i} className="text-green-400 leading-relaxed">
                      <span className="text-gray-500 mr-2">[{i + 1}]</span>
                      {entry}
                    </p>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ━━ Main Content ━━ */}
        <main className="flex-1 flex flex-col bg-gray-50/50 p-6 overflow-y-auto gap-6">

          {/* Rate-limit banner */}
          {rateLimitMsg && (
            <div className="w-full flex items-start gap-3 bg-yellow-50 border-2 border-yellow-400 rounded-2xl px-5 py-4 shadow-md">
              <span className="text-2xl mt-0.5">⏳</span>
              <div>
                <p className="font-bold text-yellow-700 text-sm">API Rate Limit</p>
                <p className="text-yellow-800 text-xs mt-1">{rateLimitMsg}</p>
                <p className="text-yellow-600 text-xs mt-1">The agent will resume automatically when the cooldown ends.</p>
              </div>
            </div>
          )}

          {/* CAPTCHA banner */}
          {captchaActive && (
            <div className="w-full flex items-start gap-3 bg-orange-50 border-2 border-orange-400 rounded-2xl px-5 py-4 shadow-md animate-pulse">
              <span className="text-2xl mt-0.5">🤖</span>
              <div>
                <p className="font-bold text-orange-700 text-sm">CAPTCHA Detected — Action Required</p>
                <p className="text-orange-800 text-xs mt-1">{captchaText}</p>
                <p className="text-orange-600 text-xs mt-1">
                  Click the screenshot below to interact directly with the browser and solve the CAPTCHA.
                  The agent will resume automatically once it&apos;s cleared.
                </p>
              </div>
            </div>
          )}

          {/* Phase pipeline indicator */}
          {phase && (
            <div className="flex items-center gap-2 text-xs font-medium">
              {Object.entries(PHASE_META).map(([key, meta]) => (
                <div key={key} className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors
                  ${phase === key ? `${meta.color} text-white shadow-md` : 'bg-gray-200 text-gray-500'}
                  ${Object.keys(PHASE_META).indexOf(key) < Object.keys(PHASE_META).indexOf(phase) ? 'bg-gray-300 text-gray-600' : ''}`}>
                  {Object.keys(PHASE_META).indexOf(key) < Object.keys(PHASE_META).indexOf(phase) && <span>✓</span>}
                  {meta.label}
                </div>
              ))}
            </div>
          )}

          {/* Travel Plan Card */}
          {travelPlan && (
            <div className="w-full bg-gradient-to-br from-white to-gray-50 border-2 border-accent-mint rounded-3xl shadow-2xl p-8">
              {/* Header with Title and Actions */}
              <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b-2 border-dashed border-gray-200">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                    {travelPlan.title}
                  </h2>
                  <p className="text-base text-gray-700 leading-relaxed">{travelPlan.summary}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const planText = JSON.stringify(travelPlan, null, 2)
                      const blob = new Blob([planText], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `travel-plan-${Date.now()}.json`
                      a.click()
                    }}
                    className="text-sm bg-accent-mint hover:bg-accent-mint/80 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg font-medium whitespace-nowrap"
                  >
                    💾 Save Plan
                  </button>
                  <button
                    onClick={() => {
                      const text = `${travelPlan.title}\n\n${travelPlan.summary}\n\nBudget: ${travelPlan.estimatedBudget || 'N/A'}`
                      navigator.clipboard.writeText(text).then(() => alert('Plan copied to clipboard!'))
                    }}
                    className="text-sm bg-accent-blue hover:bg-accent-blue/80 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg font-medium whitespace-nowrap"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="text-sm bg-accent-coral hover:bg-accent-coral/80 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg font-medium whitespace-nowrap"
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>

              {/* Budget Section */}
              {travelPlan.estimatedBudget && (
                <div className="bg-gradient-to-r from-accent-coral/20 to-accent-coral/10 border-2 border-accent-coral/40 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Estimated Budget</p>
                      <p className="text-2xl font-bold text-accent-coral">{travelPlan.estimatedBudget}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sections Header */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span>
                <span>Travel Plan Breakdown</span>
              </h3>

              {/* Sections */}
              {travelPlan.sections?.map((s, i) => {
                // Extract specific details from text for deep linking
                const extractDetails = (text) => {
                  const combined = `${s.recommendation || ''} ${s.details || ''}`.toLowerCase()
                  
                  // Extract flight details
                  const flightMatch = combined.match(/(?:flight|airline)?\s*([A-Z]{2}\d{2,4}|[A-Z]{3}\s?\d{3,4})/i)
                  const routeMatch = combined.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:to|→|-)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
                  const airlineMatch = combined.match(/(air\s+\w+|emirates|lufthansa|delta|united|british\s+airways|singapore\s+airlines|qatar|etihad|american|southwest|ryanair|easyjet)/i)
                  
                  // Extract hotel/accommodation details
                  const hotelMatch = combined.match(/(?:hotel|resort|stay|accommodation)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}(?:\s+hotel|\s+resort|\s+inn)?)/i)
                  
                  // Extract location details
                  const locationMatch = combined.match(/(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i) || 
                                       combined.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:city|area|district|downtown)/i)
                  
                  // Extract dates
                  const dateMatch = combined.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+\w+\s+\d{4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2})/i)
                  
                  return {
                    flightNumber: flightMatch ? flightMatch[1] : null,
                    airline: airlineMatch ? airlineMatch[1] : null,
                    route: routeMatch ? { from: routeMatch[1], to: routeMatch[2] } : null,
                    hotel: hotelMatch ? hotelMatch[1] : null,
                    location: locationMatch ? locationMatch[1] : null,
                    date: dateMatch ? dateMatch[1] : null,
                    searchQuery: s.recommendation || s.title
                  }
                }

                // Generate booking links with specific parameters
                const getBookingLinks = (category, section) => {
                  const cat = category?.toLowerCase() || ''
                  const details = extractDetails(section)
                  
                  if (cat.includes('flight')) {
                    const query = details.flightNumber || 
                                 (details.route ? `${details.route.from} to ${details.route.to}` : '') ||
                                 (details.airline || '') + ' flight'
                    const encodedQuery = encodeURIComponent(query)
                    
                    return [
                      { 
                        label: `✈️ Search ${details.airline || 'Flights'}`, 
                        url: `https://www.google.com/search?q=${encodedQuery}` 
                      },
                      { 
                        label: '🔗 Skyscanner', 
                        url: details.route 
                          ? `https://www.skyscanner.com/transport/flights/${details.route.from.slice(0,3).toLowerCase()}/${details.route.to.slice(0,3).toLowerCase()}/`
                          : `https://www.skyscanner.com/transport/flights/?q=${encodedQuery}`
                      },
                      { 
                        label: '🔗 Google Flights', 
                        url: `https://www.google.com/flights?q=${encodedQuery}`
                      }
                    ]
                  } else if (cat.includes('hotel') || cat.includes('accommodation')) {
                    const query = details.hotel || details.location || section.recommendation
                    const encodedQuery = encodeURIComponent(query)
                    
                    return [
                      { 
                        label: `🏨 Search ${details.hotel ? details.hotel.slice(0, 15) + '...' : 'Hotels'}`, 
                        url: `https://www.google.com/search?q=${encodedQuery}` 
                      },
                      { 
                        label: '🔗 Booking.com', 
                        url: `https://www.booking.com/searchresults.html?ss=${encodedQuery}`
                      },
                      { 
                        label: '🔗 Hotels.com', 
                        url: `https://www.hotels.com/search.do?q-destination=${encodedQuery}`
                      },
                      { 
                        label: '🔗 Airbnb', 
                        url: `https://www.airbnb.com/s/${encodedQuery}/homes`
                      }
                    ]
                  } else if (cat.includes('transport')) {
                    const query = details.route 
                      ? `${details.route.from} to ${details.route.to}`
                      : details.location || section.recommendation
                    const encodedQuery = encodeURIComponent(query)
                    
                    return [
                      { 
                        label: '🚗 Google Maps', 
                        url: `https://www.google.com/maps/search/${encodedQuery}`
                      },
                      { 
                        label: '🔗 Rome2Rio', 
                        url: `https://www.rome2rio.com/map/${encodedQuery.replace(/\s+to\s+/i, '/')}`
                      }
                    ]
                  } else if (cat.includes('visa') || cat.includes('insurance')) {
                    const query = section.recommendation || 'visa application travel insurance'
                    const encodedQuery = encodeURIComponent(query)
                    
                    return [
                      { 
                        label: '📋 VFS Global', 
                        url: `https://www.vfsglobal.com/`
                      },
                      { 
                        label: '🔍 Search Details', 
                        url: `https://www.google.com/search?q=${encodedQuery}`
                      }
                    ]
                  } else if (cat.includes('activities') || cat.includes('things to do')) {
                    const query = `${section.recommendation} ${details.location || ''}`
                    const encodedQuery = encodeURIComponent(query.trim())
                    
                    return [
                      { 
                        label: '🎯 Search Activity', 
                        url: `https://www.google.com/search?q=${encodedQuery}`
                      },
                      { 
                        label: '🔗 TripAdvisor', 
                        url: `https://www.tripadvisor.com/Search?q=${encodedQuery}`
                      },
                      { 
                        label: '🔗 Viator', 
                        url: `https://www.viator.com/searchResults/all?text=${encodedQuery}`
                      }
                    ]
                  }
                  return []
                }

                const links = getBookingLinks(s.category, s)

                // Get category icon
                const getCategoryIcon = (category) => {
                  const cat = category?.toLowerCase() || ''
                  if (cat.includes('flight')) return '✈️'
                  if (cat.includes('hotel') || cat.includes('accommodation')) return '🏨'
                  if (cat.includes('transport')) return '🚗'
                  if (cat.includes('visa') || cat.includes('insurance')) return '📋'
                  if (cat.includes('activities') || cat.includes('things to do')) return '🎯'
                  if (cat.includes('food') || cat.includes('restaurant')) return '🍽️'
                  return '📍'
                }

                return (
                  <div key={i} className="mb-6 bg-white border-2 border-gray-200 hover:border-primary/30 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all">
                    {/* Category Badge */}
                    {s.category && (
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-3 shadow-sm">
                        <span>{getCategoryIcon(s.category)}</span>
                        <span className="uppercase tracking-wide">{s.category}</span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h3>

                    {/* Recommendation Section */}
                    <div className="bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border-l-4 border-primary rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">💡 Recommended Option:</p>
                      <p className="text-base text-gray-900 leading-relaxed">{s.recommendation}</p>
                    </div>

                    {/* Details Section */}
                    {s.details && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">📝 Details:</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{s.details}</p>
                      </div>
                    )}

                    {/* Cost */}
                    {s.estimatedCost && (
                      <div className="bg-accent-coral/10 border border-accent-coral/30 rounded-lg px-4 py-2 mb-4">
                        <span className="text-sm font-bold text-accent-coral">💰 Estimated Cost: </span>
                        <span className="text-base font-bold text-gray-900">{s.estimatedCost}</span>
                      </div>
                    )}

                    {/* Alternatives */}
                    {s.alternatives?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">🔄 Alternative Options:</p>
                        <div className="flex flex-wrap gap-2">
                          {s.alternatives.map((alt, j) => (
                            <span key={j} className="text-sm bg-gradient-to-r from-accent-mint/20 to-accent-blue/20 border border-accent-mint/40 text-gray-800 px-3 py-1.5 rounded-lg font-medium">
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Booking Links */}
                    {links.length > 0 && (
                      <div className="border-t-2 border-dashed border-gray-200 pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">🔗 Book Now:</p>
                        <div className="flex flex-wrap gap-2">
                          {links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg font-medium transform hover:scale-105"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Daily Itinerary */}
              {travelPlan.dailyItinerary?.length > 0 && (
                <div className="mt-6 bg-white border-2 border-accent-purple/30 rounded-2xl p-5 shadow-md">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📅</span>
                    <span>Day-by-Day Itinerary</span>
                  </h3>
                  <div className="space-y-4">
                    {travelPlan.dailyItinerary.map((day, i) => (
                      <div key={i} className="bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-l-4 border-accent-purple rounded-lg p-4">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-2xl font-bold text-accent-purple">Day {day.day}</span>
                          <span className="text-base font-semibold text-gray-900">{day.title}</span>
                        </div>
                        {day.activities?.length > 0 && (
                          <ul className="space-y-1.5 ml-4">
                            {day.activities.map((a, j) => (
                              <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-accent-purple mt-1">▸</span>
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {travelPlan.tips?.length > 0 && (
                <div className="mt-6 bg-gradient-to-br from-accent-mint/10 to-accent-blue/10 border-2 border-accent-mint/30 rounded-2xl p-5 shadow-md">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>💡</span>
                    <span>Pro Tips & Recommendations</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {travelPlan.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-accent-mint/20">
                        <span className="text-accent-mint font-bold flex-shrink-0">✓</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Optimization Card */}
          {optimized && !travelPlan && (
            <div className="w-full bg-white border-2 border-accent-coral rounded-3xl shadow-lg p-5">
              <h3 className="text-accent-coral font-semibold text-sm mb-2">⚡ Optimization Results</h3>
              <p className="text-xs text-gray-700 mb-3">{optimized.reasoning}</p>
              {optimized.totalEstimate && (
                <p className="text-sm font-bold text-accent-coral mb-3">Total Estimate: {optimized.totalEstimate}</p>
              )}
              {optimized.ranked?.map((r, i) => (
                <div key={i} className="bg-accent-mint/10 border border-accent-mint/30 rounded-2xl p-3 mb-2 text-xs">
                  <span className="font-semibold text-gray-800 capitalize">{r.category}</span>
                  {r.recommended && (
                    <p className="text-primary mt-1">
                      Recommended: {r.recommended.name} — {r.recommended.price}
                      <span className="text-gray-600 ml-2">{r.recommended.reason}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Collected Data Summary */}
          {collectedData.length > 0 && !travelPlan && (
            <div className="w-full bg-white border-2 border-gray-200 rounded-3xl shadow-md p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Collected Data ({collectedData.length} items)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {collectedData.map((item, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-2.5 text-xs hover:shadow-md transition-shadow">
                    <p className="font-semibold text-gray-800 truncate">{item.name || 'Unknown'}</p>
                    {item.price && <p className="text-green-600 font-semibold">{item.price}</p>}
                    {item.rating && <p className="text-amber-500">★ {item.rating}</p>}
                    {item.details && <p className="text-gray-600 truncate">{item.details}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Browser Screenshot — interactive */}
          {screenshot ? (
            <div className="w-full">
              {/* Clickable screenshot */}
              <div className="relative inline-block w-full cursor-crosshair" onClick={handleScreenshotClick}>
                <img ref={imgRef} src={screenshot} alt="Browser viewport"
                  className="w-full rounded-3xl border-2 border-accent-mint shadow-2xl select-none" draggable={false} />
                {/* Click indicator */}
                {clickMarker && (
                  <span className="absolute pointer-events-none animate-ping" style={{
                    left: clickMarker.x - 10, top: clickMarker.y - 10,
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'rgba(59,130,246,0.6)', border: '2px solid #3b82f6',
                  }} />
                )}
                <p className="absolute bottom-2 right-3 text-[10px] text-gray-700 bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
                  Click to interact
                </p>
              </div>

              {/* Interaction toolbar */}
              {canInteract && (
                <div className="mt-3 flex items-center gap-2">
                  {/* Text input */}
                  <input
                    type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUserType() } }}
                    placeholder="Type text into browser…"
                    className="flex-1 bg-white border-2 border-gray-300 rounded-2xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button onClick={handleUserType} disabled={!userInput.trim()}
                    className="bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-full transition-all shadow-md">
                    Send
                  </button>

                  <div className="h-6 w-px bg-gray-300" />

                  {/* Quick action buttons */}
                  <button onClick={() => handleUserKey('Enter')} title="Press Enter"
                    className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-2 rounded-2xl transition-all border-2 border-gray-300 shadow-sm">
                    Enter ↵
                  </button>
                  <button onClick={() => handleUserScroll('down')} title="Scroll Down"
                    className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-2 rounded-2xl transition-all border-2 border-gray-300 shadow-sm">
                    ↓ Scroll
                  </button>
                  <button onClick={() => handleUserScroll('up')} title="Scroll Up"
                    className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-2 rounded-2xl transition-all border-2 border-gray-300 shadow-sm">
                    ↑ Scroll
                  </button>
                  <button onClick={handleUserBack} title="Go Back"
                    className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-2 rounded-2xl transition-all border-2 border-gray-300 shadow-sm">
                    ◀ Back
                  </button>
                </div>
              )}
            </div>
          ) : (
            !travelPlan && !running && (
              <div className="flex-1 flex items-center justify-center text-center text-gray-500">
                <div>
                  <p className="text-5xl mb-4">🌐</p>
                  <p className="text-lg font-medium text-gray-700">No browser stream yet</p>
                  <p className="text-sm mt-1 text-gray-600">Enter a travel goal and start the agent.</p>
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  )
}

export default Agent
