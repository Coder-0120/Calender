import { useState, useEffect, useRef } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const MONTH_IMAGES = [
  "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=800&q=80", // Jan – snowy mountain
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80", // Feb – winter peaks
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&q=80", // Mar – spring bloom
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlCm3uFI7LebOMI5ztFmFtRVL7gqYiua_2gw&s", // Apr – flowers
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80", // May – green hills
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80", // Jun – lake
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", // Jul – beach
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80", // Aug – sunset
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80", // Sep – forest path
  "https://images.unsplash.com/photo-1444927714506-26a851f7dbf6?w=800&q=80", // Oct – autumn
  "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=800&q=80", // Nov – fog
  "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&q=80", // Dec – snow
];

const HOLIDAYS = {
  "1-1": "New Year's Day",
  "1-26": "Republic Day",
  "3-8": "Women's Day",
  "8-15": "Independence Day",
  "10-2": "Gandhi Jayanti",
  "12-25": "Christmas",
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  let d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday-first
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function isInRange(cell, start, end) {
  if (!start || !end) return false;
  const toNum = (d) => d.year * 10000 + d.month * 100 + d.day;
  const cn = toNum(cell), sn = toNum(start), en = toNum(end);
  const lo = Math.min(sn, en), hi = Math.max(sn, en);
  return cn > lo && cn < hi;
}

function isRangeEdge(cell, start, end) {
  if (!start) return false;
  if (!end) return isSameDay(cell, start);
  const toNum = (d) => d.year * 10000 + d.month * 100 + d.day;
  const cn = toNum(cell), sn = toNum(start), en = toNum(end);
  const lo = Math.min(sn, en), hi = Math.max(sn, en);
  return cn === lo || cn === hi;
}

function formatDate(d) {
  if (!d) return "";
  return `${d.day} ${MONTHS[d.month]} ${d.year}`;
}

function rangeDays(start, end) {
  if (!start || !end) return 0;
  const a = new Date(start.year, start.month, start.day);
  const b = new Date(end.year, end.month, end.day);
  return Math.abs(Math.round((b - a) / 86400000)) + 1;
}

export default function WallCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [notes, setNotes] = useState({});
  const [noteInput, setNoteInput] = useState("");
  const [theme, setTheme] = useState("light");
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState("next");
  const [showNotePanel, setShowNotePanel] = useState(false);
  const imgRef = useRef(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const noteKey = rangeStart
    ? `${rangeStart.year}-${rangeStart.month}-${rangeStart.day}`
    : null;

  useEffect(() => {
    if (noteKey) setNoteInput(notes[noteKey] || "");
  }, [noteKey]);

  function navigate(dir) {
    setFlipDir(dir);
    setFlipping(true);
    setTimeout(() => {
      setViewMonth((m) => {
        let nm = m + (dir === "next" ? 1 : -1);
        if (nm > 11) { setViewYear((y) => y + 1); return 0; }
        if (nm < 0) { setViewYear((y) => y - 1); return 11; }
        return nm;
      });
      setFlipping(false);
    }, 350);
  }

  function handleDayClick(day) {
    const cell = { year: viewYear, month: viewMonth, day };
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(cell);
      setRangeEnd(null);
      setShowNotePanel(false);
    } else {
      setRangeEnd(cell);
      setShowNotePanel(true);
    }
  }

  function saveNote() {
    if (!noteKey) return;
    setNotes((prev) => ({ ...prev, [noteKey]: noteInput }));
  }

  function deleteNote() {
    if (!noteKey) return;
    setNotes((prev) => { const n = { ...prev }; delete n[noteKey]; return n; });
    setNoteInput("");
  }

  const activeEnd = rangeEnd || hovered;
  const totalDays = rangeStart && activeEnd ? rangeDays(rangeStart, activeEnd) : null;
  const imgSrc = MONTH_IMAGES[viewMonth];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isDark = theme === "dark";

  const styles = {
    root: {
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      minHeight: "100vh",
      background: isDark ? "#111317" : "#eef1f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 12px",
      transition: "background 0.4s",
    },
    card: {
      background: isDark ? "#1c1f26" : "#fff",
      borderRadius: "20px",
      boxShadow: isDark
        ? "0 8px 48px rgba(0,0,0,0.6)"
        : "0 8px 48px rgba(30,60,120,0.13)",
      overflow: "hidden",
      width: "100%",
      maxWidth: "860px",
      display: "flex",
      flexDirection: "column",
    },
    imageWrap: {
      position: "relative",
      width: "100%",
      height: "220px",
      overflow: "hidden",
      flexShrink: 0,
    },
    heroImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      transition: "opacity 0.4s",
    },
    heroOverlay: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(135deg, rgba(20,100,200,0.35) 0%, rgba(0,0,0,0.1) 100%)",
    },
    monthLabel: {
      position: "absolute",
      bottom: 0,
      right: 0,
      padding: "12px 28px 14px",
      background: isDark ? "rgba(14,100,220,0.92)" : "rgba(14,120,240,0.92)",
      clipPath: "polygon(18px 0%, 100% 0%, 100% 100%, 0% 100%)",
      textAlign: "right",
    },
    monthYear: {
      fontSize: "13px",
      fontWeight: 700,
      color: "rgba(255,255,255,0.85)",
      letterSpacing: "2px",
    },
    monthName: {
      fontSize: "26px",
      fontWeight: 900,
      color: "#fff",
      letterSpacing: "1px",
      lineHeight: 1,
      textTransform: "uppercase",
    },
    navRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 24px 0",
    },
    navBtn: {
      background: "none",
      border: `1.5px solid ${isDark ? "#334" : "#c5d0e4"}`,
      borderRadius: "50%",
      width: 36,
      height: 36,
      cursor: "pointer",
      fontSize: "18px",
      color: isDark ? "#7ba4e8" : "#2260cc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 0.15s, color 0.15s",
    },
    navTitle: {
      fontSize: "17px",
      fontWeight: 800,
      color: isDark ? "#d0dcf8" : "#1a2a5e",
      letterSpacing: "0.5px",
    },
    body: {
      display: "flex",
      flexDirection: "row",
      gap: 0,
      padding: "12px 0 0",
      flexWrap: "wrap",
    },
    calSection: {
      flex: "1 1 320px",
      padding: "0 20px 20px",
      minWidth: 0,
    },
    dayHeaders: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: 2,
      marginBottom: 4,
    },
    dayHeader: {
      textAlign: "center",
      fontSize: "11px",
      fontWeight: 800,
      letterSpacing: "1px",
      padding: "4px 0",
      color: isDark ? "#6080b8" : "#a0aec0",
    },
    dayHeaderWeekend: {
      color: isDark ? "#e07070" : "#e05555",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: 3,
    },
    notePanel: {
      flex: "0 0 220px",
      borderLeft: `1px solid ${isDark ? "#2a2e3a" : "#e8edf5"}`,
      padding: "8px 20px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      minWidth: 0,
    },
    notePanelTitle: {
      fontSize: "11px",
      fontWeight: 800,
      letterSpacing: "1.5px",
      color: isDark ? "#5070a0" : "#a0aec0",
      textTransform: "uppercase",
      marginBottom: 2,
    },
    noteRange: {
      fontSize: "12px",
      color: isDark ? "#7ba4e8" : "#2260cc",
      fontWeight: 700,
      lineHeight: 1.5,
    },
    textarea: {
      resize: "none",
      border: `1.5px solid ${isDark ? "#2a3050" : "#d0daf0"}`,
      borderRadius: "10px",
      padding: "10px",
      fontSize: "13px",
      fontFamily: "'Nunito', sans-serif",
      color: isDark ? "#c8d8f8" : "#1a2a5e",
      background: isDark ? "#14182a" : "#f4f7fd",
      outline: "none",
      flex: 1,
      minHeight: "90px",
      maxHeight: "160px",
      transition: "border-color 0.2s",
    },
    saveBtn: {
      background: isDark ? "#1a5cc8" : "#2260cc",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "8px 14px",
      fontSize: "12px",
      fontWeight: 800,
      cursor: "pointer",
      letterSpacing: "0.5px",
    },
    deleteBtn: {
      background: "none",
      border: "none",
      fontSize: "11px",
      color: isDark ? "#884040" : "#c0392b",
      cursor: "pointer",
      textDecoration: "underline",
      textAlign: "left",
    },
    summaryRow: {
      fontSize: "12px",
      color: isDark ? "#5070a0" : "#8090b8",
      marginTop: 4,
    },
    themeBtn: {
      background: "none",
      border: `1.5px solid ${isDark ? "#334" : "#c5d0e4"}`,
      borderRadius: "20px",
      padding: "4px 14px",
      fontSize: "12px",
      cursor: "pointer",
      color: isDark ? "#7ba4e8" : "#2260cc",
      fontWeight: 700,
    },
    topBar: {
      display: "flex",
      justifyContent: "flex-end",
      padding: "10px 20px 0",
    },
    holidayDot: {
      width: 4,
      height: 4,
      borderRadius: "50%",
      background: isDark ? "#e07070" : "#e05555",
      margin: "1px auto 0",
    },
    spirals: {
      display: "flex",
      justifyContent: "center",
      gap: "22px",
      padding: "10px 0 6px",
      background: isDark ? "#1c1f26" : "#fff",
    },
  };

  function dayStyle(day, idx) {
    if (!day) return {};
    const col = idx % 7;
    const isWeekend = col === 5 || col === 6;
    const cell = { year: viewYear, month: viewMonth, day };
    const isToday =
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day;
    const isStart = isSameDay(cell, rangeStart);
    const isEnd = isSameDay(cell, rangeEnd);
    const inRange = isInRange(cell, rangeStart, activeEnd);
    const isEdge = isRangeEdge(cell, rangeStart, activeEnd);
    const isHov = hovered && isSameDay(cell, hovered);

    return {
      textAlign: "center",
      padding: "5px 2px 4px",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: isToday ? 900 : 500,
      cursor: "pointer",
      userSelect: "none",
      transition: "background 0.12s, color 0.12s",
      background: isEdge
        ? isDark ? "#1a5cc8" : "#2260cc"
        : inRange
        ? isDark ? "#152050" : "#dce8ff"
        : isHov
        ? isDark ? "#202840" : "#edf2ff"
        : isToday
        ? isDark ? "#1a2a50" : "#f0f4ff"
        : "transparent",
      color: isEdge
        ? "#fff"
        : isWeekend
        ? isDark ? "#e07070" : "#e05555"
        : inRange
        ? isDark ? "#7ba4e8" : "#2260cc"
        : isToday
        ? isDark ? "#7ba4e8" : "#2260cc"
        : isDark ? "#c8d8f8" : "#1a2a5e",
      outline: isToday && !isEdge ? `2px solid ${isDark ? "#2a4080" : "#c0d0f0"}` : "none",
      outlineOffset: "-2px",
      position: "relative",
    };
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        {/* Spirals */}
        <div style={styles.spirals}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: `2.5px solid ${isDark ? "#384060" : "#b8c8e0"}`,
                background: isDark ? "#23273a" : "#dce8f0",
              }}
            />
          ))}
        </div>

        {/* Hero Image */}
        <div
          style={{
            ...styles.imageWrap,
            opacity: flipping ? 0 : 1,
            transform: flipping
              ? `perspective(900px) rotateX(${flipDir === "next" ? "-8deg" : "8deg"})`
              : "perspective(900px) rotateX(0deg)",
            transition: "opacity 0.35s, transform 0.35s",
          }}
        >
          <img ref={imgRef} src={imgSrc} alt={MONTHS[viewMonth]} style={styles.heroImg} />
          <div style={styles.heroOverlay} />
          <div style={styles.monthLabel}>
            <div style={styles.monthYear}>{viewYear}</div>
            <div style={styles.monthName}>{MONTHS[viewMonth]}</div>
          </div>
        </div>

        {/* Top bar */}
        <div style={styles.topBar}>
          <button style={styles.themeBtn} onClick={() => setTheme(isDark ? "light" : "dark")}>
            {isDark ? "☀ Light" : "☾ Dark"}
          </button>
        </div>

        {/* Nav */}
        <div style={styles.navRow}>
          <button style={styles.navBtn} onClick={() => navigate("prev")}>‹</button>
          <span style={styles.navTitle}>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button style={styles.navBtn} onClick={() => navigate("next")}>›</button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Calendar grid */}
          <div style={styles.calSection}>
            <div style={styles.dayHeaders}>
              {DAYS_SHORT.map((d, i) => (
                <div
                  key={d}
                  style={{
                    ...styles.dayHeader,
                    ...(i >= 5 ? styles.dayHeaderWeekend : {}),
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
            <div style={styles.grid}>
              {cells.map((day, idx) => {
                const holidayKey = `${viewMonth + 1}-${day}`;
                const holiday = day ? HOLIDAYS[holidayKey] : null;
                return (
                  <div
                    key={idx}
                    style={day ? dayStyle(day, idx) : {}}
                    onClick={() => day && handleDayClick(day)}
                    onMouseEnter={() => {
                      if (day) setHovered({ year: viewYear, month: viewMonth, day });
                    }}
                    onMouseLeave={() => setHovered(null)}
                    title={holiday || undefined}
                  >
                    {day ? (
                      <>
                        {day}
                        {holiday && <div style={styles.holidayDot} />}
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Range summary */}
            {rangeStart && rangeEnd && (
              <div style={styles.summaryRow}>
                {formatDate(rangeStart)} → {formatDate(rangeEnd)} &nbsp;·&nbsp; {totalDays} day{totalDays !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Notes panel */}
          <div style={styles.notePanel}>
            <div style={styles.notePanelTitle}>Notes</div>
            {rangeStart ? (
              <>
                <div style={styles.noteRange}>
                  {rangeEnd
                    ? `${formatDate(rangeStart)}\n→ ${formatDate(rangeEnd)}`
                    : `From: ${formatDate(rangeStart)}\nClick another date to set end`}
                </div>
                <textarea
                  style={styles.textarea}
                  placeholder="Add a note for this range…"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#2260cc")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = isDark ? "#2a3050" : "#d0daf0")
                  }
                />
                <button style={styles.saveBtn} onClick={saveNote}>
                  Save Note
                </button>
                {notes[noteKey] && (
                  <button style={styles.deleteBtn} onClick={deleteNote}>
                    Delete note
                  </button>
                )}
              </>
            ) : (
              <div
                style={{
                  fontSize: "12px",
                  color: isDark ? "#4060a0" : "#b0bcd8",
                  lineHeight: 1.7,
                }}
              >
                Select a start date on the calendar to add notes to a date range.
              </div>
            )}

            {/* Saved notes list */}
            {Object.keys(notes).length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ ...styles.notePanelTitle, marginBottom: 6 }}>
                  Saved
                </div>
                <div
                  style={{
                    maxHeight: 120,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {Object.entries(notes).map(([k, v]) => {
                    const [y, m, d] = k.split("-").map(Number);
                    return (
                      <div
                        key={k}
                        style={{
                          background: isDark ? "#14182a" : "#f4f7fd",
                          borderRadius: 8,
                          padding: "6px 10px",
                          fontSize: "11px",
                          color: isDark ? "#8090b8" : "#5060a0",
                          cursor: "pointer",
                          border: `1px solid ${isDark ? "#202840" : "#e0e8f8"}`,
                        }}
                        onClick={() => {
                          setRangeStart({ year: y, month: m, day: d });
                          setRangeEnd(null);
                          setNoteInput(v);
                          setShowNotePanel(true);
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>
                          {d} {MONTHS[m]}
                        </span>
                        <br />
                        {v.slice(0, 40)}{v.length > 40 ? "…" : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "10px 0 14px",
            fontSize: "10px",
            letterSpacing: "1.5px",
            color: isDark ? "#2a3a60" : "#c0cce0",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Wall Calendar &nbsp;·&nbsp; {viewYear}
        </div>
      </div>

      {/* Responsive styles injected */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;700;800;900&display=swap');
        @media (max-width: 600px) {
          .cal-body { flex-direction: column !important; }
          .note-panel { border-left: none !important; border-top: 1px solid #e8edf5; }
        }
      `}</style>
    </div>
  );
}