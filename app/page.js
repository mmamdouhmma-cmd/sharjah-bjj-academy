"use client";

import { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from "react";
import {
  Users, ClipboardCheck, BarChart3, DollarSign, Search, X, ChevronDown, ChevronRight,
  Check, History, Sun, Moon, Languages, Swords, Shield, Brain, Zap, BookOpen, Target,
  Dumbbell, RefreshCw, Trash2, UserPlus, Baby, User, Loader2, Pencil, Phone, Lock, LogOut
} from "lucide-react";
import { translations, MONTHS_EN, MONTHS_AR } from "@/lib/i18n";
import {
  ADULT_BELTS, KIDS_BELTS, ALL_BELTS, getBeltMap, getBeltInfo, getAge, isKid,
  PHYSICAL_ITEMS, TECHNICAL_ITEMS, FIGHTER_ATTRS, TECH_LEVELS
} from "@/lib/constants";
import * as db from "@/lib/db";

const AppContext = createContext();
const useApp = () => useContext(AppContext);
const today = () => new Date().toISOString().split("T")[0];

// ═══════════════════ UI COMPONENTS ═══════════════════

function Badge({ belt, stripes, size = "md" }) {
  const b = getBeltInfo(belt);
  const s = size === "sm" ? { w: 60, h: 14, st: 3 } : { w: 90, h: 20, st: 5 };
  const isWhitish = belt === "white" || belt.endsWith("_white");
  const hasDual = !!b.dual;
  const { lang } = useApp();
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: s.w, height: s.h, borderRadius: 4, overflow: "hidden",
        background: hasDual ? `linear-gradient(to bottom, ${b.bg} 50%, ${b.dual} 50%)` : b.bg,
        border: isWhitish && !hasDual ? "1.5px solid var(--border)" : "none",
        display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4, gap: 2,
      }}>
        {Array.from({ length: stripes }).map((_, i) => (
          <div key={i} style={{
            width: s.st, height: s.h - 6, borderRadius: 1,
            background: (belt === "black" || belt.endsWith("_black")) ? "#C41E1E" : "#fff",
            border: isWhitish && !hasDual ? "1px solid #bbb" : "none",
          }} />
        ))}
      </div>
      {size !== "sm" && <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>{lang === "ar" ? b.labelAr : b.label}</span>}
    </div>
  );
}

function Modal({ open, onClose, title, children, width = 500 }) {
  const { t } = useApp();
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg)", borderRadius: 12, width: "100%", maxWidth: width,
        maxHeight: "90vh", overflow: "auto", border: "1px solid var(--border)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.3)", direction: t.dir,
      }}>
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, background: "var(--bg)", zIndex: 1,
        }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}><X size={18} /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>{label}</label>}
      <input {...props} style={{
        width: "100%", padding: "8px 12px", borderRadius: 6,
        border: "1px solid var(--border)", background: "var(--surface)",
        color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box", ...props.style,
      }} />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 }}>{label}</label>}
      <select {...props} style={{
        width: "100%", padding: "8px 12px", borderRadius: 6,
        border: "1px solid var(--border)", background: "var(--surface)",
        color: "var(--text)", fontSize: 14, outline: "none",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, variant = "primary", loading: isLoading, ...props }) {
  const styles = {
    primary: { background: "var(--accent)", color: "#fff", border: "none" },
    secondary: { background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" },
    danger: { background: "#DC2626", color: "#fff", border: "none" },
    success: { background: "#059669", color: "#fff", border: "none" },
  };
  return (
    <button disabled={isLoading || props.disabled} {...props} style={{
      padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
      cursor: "pointer", transition: "all 0.15s", ...styles[variant],
      opacity: (isLoading || props.disabled) ? 0.5 : 1,
      display: "inline-flex", alignItems: "center", gap: 6, ...props.style,
    }}>
      {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

function RadarChart({ data, size = 160, color = "#C41E1E" }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 24;
  const attrs = FIGHTER_ATTRS.map(a => ({ ...a, val: data[a.key] || 0 }));
  const n = attrs.length;
  const step = (2 * Math.PI) / n;
  const pt = (i, pct) => [cx + r * pct * Math.cos(i * step - Math.PI / 2), cy + r * pct * Math.sin(i * step - Math.PI / 2)];
  const poly = attrs.map((a, i) => pt(i, a.val / 100).join(",")).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map(lv => (
        <polygon key={lv} points={attrs.map((_, i) => pt(i, lv).join(",")).join(" ")} fill="none" stroke="var(--border)" strokeWidth={0.5} opacity={0.5} />
      ))}
      {attrs.map((_, i) => { const [x, y] = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth={0.5} opacity={0.3} />; })}
      <polygon points={poly} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.5} />
      {attrs.map((a, i) => { const [x, y] = pt(i, a.val / 100); return <circle key={`d${i}`} cx={x} cy={y} r={3} fill={a.color} />; })}
    </svg>
  );
}

function GroupHeader({ label, collapsed, onClick }) {
  return (
    <div onClick={onClick} style={{
      padding: "8px 12px", background: "var(--surface2)", borderRadius: 6,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      cursor: "pointer", marginBottom: 6, marginTop: 10,
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--accent)" }}>{label}</span>
      {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
    </div>
  );
}

function TechBadge({ value }) {
  const { t } = useApp();
  const level = TECH_LEVELS.find(l => l.value === value);
  if (!level || !value) return null;
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 10,
      background: level.color + "22", color: level.color,
      fontWeight: 600, textTransform: "uppercase",
    }}>{level.labelKey ? t[level.labelKey] : "—"}</span>
  );
}

// ═══════════════════ STUDENTS PAGE ═══════════════════

function StudentsPage({ students, reload }) {
  const { t, lang } = useApp();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", dob: "", belt: "white", stripes: 0, membershipStart: today(), membershipEnd: "", amountPaid: 0, phone: "" });
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const isExpired = (s) => s.membershipEnd && new Date(s.membershipEnd) < new Date();

  const openAdd = () => { setForm({ name: "", dob: "", belt: "white", stripes: 0, membershipStart: today(), membershipEnd: "", amountPaid: 0 }); setModal("add"); };
  const openEdit = (s) => { setForm({ name: s.name, dob: s.dob, belt: s.belt, stripes: s.stripes, membershipStart: s.membershipStart, membershipEnd: s.membershipEnd, amountPaid: 0, phone: s.phone || "", _id: s.id }); setModal(s.id); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal === "add") {
        await db.createStudent(form);
      } else {
        await db.updateStudent(form._id, form);
      }
      await reload();
      setModal(null);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleRenew = (student) => {
    const end = new Date(); end.setMonth(end.getMonth() + 1);
    setForm({ ...student, _id: student.id, membershipStart: today(), membershipEnd: end.toISOString().split("T")[0], amountPaid: 0 });
    setModal("renew-" + student.id);
  };

  const handleRenewSave = async (studentId) => {
    if (form.amountPaid <= 0) return;
    setSaving(true);
    try {
      await db.renewStudent(studentId, {
        membershipStart: form.membershipStart,
        membershipEnd: form.membershipEnd,
        amount: Number(form.amountPaid),
        description: `${t.renewal}: ${form.membershipStart} → ${form.membershipEnd}`,
      });
      await reload();
      setModal(null);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("?")) return;
    setSaving(true);
    try { await db.deleteStudent(id); await reload(); setModal(null); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>{t.students}</h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: 13 }}>{students.length} {t.enrolled}</p>
        </div>
        <Btn onClick={openAdd}><UserPlus size={14} /> {t.addStudent}</Btn>
      </div>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={14} style={{ position: "absolute", top: 11, left: 12, color: "var(--muted)" }} />
        <input placeholder={t.searchStudents} value={search} onChange={e => setSearch(e.target.value)} style={{
          width: "100%", padding: "8px 12px 8px 34px", borderRadius: 6, border: "1px solid var(--border)",
          background: "var(--surface)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box",
        }} />
      </div>
      {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}><Users size={40} strokeWidth={1} style={{ marginBottom: 8, opacity: 0.3 }} /><p>{search ? t.noResults : t.addFirst}</p></div>}
      <div style={{ display: "grid", gap: 8 }}>
        {filtered.map(s => {
          const expired = isExpired(s); const bi = getBeltInfo(s.belt);
          return (
            <div key={s.id} onClick={() => openEdit(s)} style={{
              padding: 14, borderRadius: 10, background: "var(--surface)",
              border: `1px solid ${expired ? "#DC262644" : "var(--border)"}`,
              display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                background: bi.dual ? `linear-gradient(135deg, ${bi.bg} 50%, ${bi.dual} 50%)` : bi.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: bi.text, fontWeight: 700, fontSize: 16,
                border: s.belt === "white" ? "1px solid var(--border)" : "none",
              }}>{s.name.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 80 }}>
                <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  {s.name}
                  {s.dob && <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 400 }}>({getAge(s.dob)}{isKid(s.dob) ? ` · ${t.kid}` : ""})</span>}
                </div>
                {s.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                    <Phone size={10} style={{ color: "var(--muted)", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{s.phone}</span>
                  </div>
                )}
                <Badge belt={s.belt} stripes={s.stripes} size="sm" />
              </div>
              {expired && <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: "#DC262622", color: "#DC2626", fontWeight: 600 }}>{t.expired}</span>}
              {expired && <Btn variant="success" onClick={e => { e.stopPropagation(); handleRenew(s); }} style={{ fontSize: 11, padding: "5px 10px" }}><RefreshCw size={12} /></Btn>}
            </div>
          );
        })}
      </div>

      <Modal open={modal === "add" || (modal && !String(modal).startsWith("renew"))} onClose={() => setModal(null)} title={modal === "add" ? t.addStudent : t.editStudent}>
        <Input label={t.name} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label={t.phone} type="tel" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <Input label={t.dob} type="date" value={form.dob || ""} onChange={e => {
          const d = e.target.value; const m = getBeltMap(d);
          setForm({ ...form, dob: d, belt: m[form.belt] ? form.belt : "white" });
        }} />
        {form.dob && (
          <div style={{ fontSize: 12, color: isKid(form.dob) ? "#F59E0B" : "var(--muted)", marginBottom: 12, padding: "6px 10px", background: "var(--surface2)", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
            {isKid(form.dob) ? <Baby size={14} /> : <User size={14} />} {t.age}: {getAge(form.dob)} — {isKid(form.dob) ? t.kidBelts : t.adultBelts}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Select label={t.belt} value={form.belt} onChange={e => setForm({ ...form, belt: e.target.value })}
            options={Object.entries(getBeltMap(form.dob)).map(([k, v]) => ({ value: k, label: lang === "ar" ? v.labelAr : v.label }))} />
          <Select label={t.stripes} value={form.stripes} onChange={e => setForm({ ...form, stripes: Number(e.target.value) })}
            options={[0,1,2,3,4].map(n => ({ value: n, label: `${n}` }))} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label={t.memberStart} type="date" value={form.membershipStart} onChange={e => setForm({ ...form, membershipStart: e.target.value })} />
          <Input label={t.memberEnd} type="date" value={form.membershipEnd} onChange={e => setForm({ ...form, membershipEnd: e.target.value })} />
        </div>
        {modal === "add" && <Input label={t.amountPaid} type="number" value={form.amountPaid} onChange={e => setForm({ ...form, amountPaid: e.target.value })} />}
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
          {modal !== "add" && <Btn variant="danger" loading={saving} onClick={() => handleDelete(form._id)} style={{ marginRight: "auto" }}><Trash2 size={13} /> {t.delete}</Btn>}
          <Btn variant="secondary" onClick={() => setModal(null)}>{t.cancel}</Btn>
          <Btn loading={saving} onClick={handleSave}>{t.save}</Btn>
        </div>
      </Modal>

      <Modal open={modal && String(modal).startsWith("renew")} onClose={() => setModal(null)} title={t.renewMembership} width={380}>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>{t.renewDesc}</p>
        <Input label={t.newStart} type="date" value={form.membershipStart} onChange={e => setForm({ ...form, membershipStart: e.target.value })} />
        <Input label={t.newEnd} type="date" value={form.membershipEnd} onChange={e => setForm({ ...form, membershipEnd: e.target.value })} />
        <Input label={t.amount} type="number" value={form.amountPaid} onChange={e => setForm({ ...form, amountPaid: e.target.value })} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <Btn variant="secondary" onClick={() => setModal(null)}>{t.cancel}</Btn>
          <Btn variant="success" loading={saving} onClick={() => handleRenewSave(String(modal).replace("renew-", ""))}><RefreshCw size={13} /> {t.renewPay}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════ ATTENDANCE PAGE ═══════════════════

function AttendancePage({ students, patchStudent }) {
  const { t, lang } = useApp();
  const months = lang === "ar" ? MONTHS_AR : MONTHS_EN;
  const [selectedDate, setSelectedDate] = useState(today());
  const [viewHistory, setViewHistory] = useState(null);
  const [toggling, setToggling] = useState(null);

  const handleToggle = async (sid) => {
    setToggling(sid);
    try {
      const added = await db.toggleAttendance(sid, selectedDate);
      patchStudent(sid, s => ({
        ...s,
        attendance: added
          ? [...(s.attendance || []), selectedDate]
          : (s.attendance || []).filter(d => d !== selectedDate),
      }));
    } catch (e) { console.error(e); }
    setToggling(null);
  };

  const getHistory = (student) => {
    const att = (student.attendance || []).sort().reverse();
    const byMonth = {};
    att.forEach(d => { const key = d.substring(0, 7); if (!byMonth[key]) byMonth[key] = []; byMonth[key].push(d); });
    return byMonth;
  };
  const presentCount = students.filter(s => (s.attendance || []).includes(selectedDate)).length;

  return (
    <div>
      <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>{t.attendance}</h2>
      <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 16px" }}>{presentCount} / {students.length} {t.present}</p>
      <Input label={t.date} type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
      <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
        {students.map(s => {
          const present = (s.attendance || []).includes(selectedDate);
          return (
            <div key={s.id} style={{
              padding: "10px 14px", borderRadius: 8, background: "var(--surface)",
              border: `1px solid ${present ? "#05966944" : "var(--border)"}`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <button onClick={() => handleToggle(s.id)} disabled={toggling === s.id} style={{
                width: 28, height: 28, borderRadius: 6, border: `2px solid ${present ? "#059669" : "var(--border)"}`,
                background: present ? "#059669" : "transparent", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0,
              }}>{toggling === s.id ? <Loader2 size={12} className="animate-spin" /> : present ? <Check size={14} /> : null}</button>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{(s.attendance || []).length} {t.sessions}</span>
              </div>
              <button onClick={() => setViewHistory(s)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                <History size={13} /> {t.history}
              </button>
            </div>
          );
        })}
        {students.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>{t.addStudentsFirst}</div>}
      </div>
      <Modal open={!!viewHistory} onClose={() => setViewHistory(null)} title={`${viewHistory?.name} — ${t.attendance}`}>
        {viewHistory && (() => {
          const history = getHistory(viewHistory);
          const mos = Object.keys(history).sort().reverse();
          if (mos.length === 0) return <p style={{ color: "var(--muted)" }}>{t.noRecords}</p>;
          return mos.map(m => (
            <div key={m} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>{months[parseInt(m.split("-")[1]) - 1]} {m.split("-")[0]} — {history[m].length} {t.days}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {history[m].map(d => <span key={d} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "var(--surface2)" }}>{d.substring(8)}</span>)}
              </div>
            </div>
          ));
        })()}
      </Modal>
    </div>
  );
}

// ═══════════════════ PROGRESS PAGE ═══════════════════

function ProgressPage({ students, patchStudent }) {
  const { t, lang } = useApp();
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("fighter");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const saveTimers = useRef({});
  const toggleGroup = (g) => setCollapsedGroups(prev => ({ ...prev, [g]: !prev[g] }));

  const handleFighterChange = (sid, key, val) => {
    const numVal = Math.min(100, Math.max(0, Number(val) || 0));
    patchStudent(sid, s => ({ ...s, fighterRatings: { ...(s.fighterRatings || {}), [key]: numVal } }));
    const timerKey = `${sid}-${key}`;
    clearTimeout(saveTimers.current[timerKey]);
    saveTimers.current[timerKey] = setTimeout(() => {
      db.updateFighterRating(sid, key, numVal).catch(console.error);
    }, 500);
  };
  const handleTechChange = async (sid, key, val) => {
    patchStudent(sid, s => ({ ...s, technical: { ...(s.technical || {}), [key]: val } }));
    try { await db.updateTechnicalEval(sid, key, val); } catch (e) { console.error(e); }
  };
  const handlePhysChange = async (sid, key, val) => {
    patchStudent(sid, s => ({ ...s, physical: { ...(s.physical || {}), [key]: val } }));
    try { await db.updatePhysicalEval(sid, key, val); } catch (e) { console.error(e); }
  };
  const handleBeltChange = async (sid, field, val) => {
    const dbField = field === "stripes" ? "stripes" : "belt";
    const dbVal = field === "stripes" ? Number(val) : val;
    patchStudent(sid, { [field]: dbVal });
    try { await db.updateStudentBelt(sid, dbField, dbVal); } catch (e) { console.error(e); }
  };

  const getOverall = (s) => {
    const fr = s.fighterRatings || {};
    const vals = FIGHTER_ATTRS.map(a => fr[a.key] || 0).filter(v => v > 0);
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  };
  const getTechPct = (s) => Math.round(TECHNICAL_ITEMS.filter(i => (s.technical || {})[i.key]).length / TECHNICAL_ITEMS.length * 100);
  const getPhysPct = (s) => Math.round(PHYSICAL_ITEMS.filter(i => (s.physical || {})[i.key]).length / PHYSICAL_ITEMS.length * 100);
  const itemLabel = (item) => lang === "ar" ? item.labelAr : item.label;

  const tabs = [
    { id: "fighter", label: t.fighterRating, Icon: Swords },
    { id: "technical", label: t.technical, Icon: Shield },
    { id: "physical", label: t.physical, Icon: Dumbbell },
  ];

  return (
    <div>
      <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>{t.progressTitle}</h2>
      <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 16px" }}>{t.progressDesc}</p>
      <div style={{ display: "grid", gap: 8 }}>
        {students.map(s => (
          <div key={s.id} style={{ borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div onClick={() => { setSelected(selected === s.id ? null : s.id); setTab("fighter"); }} style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <RadarChart data={s.fighterRatings || {}} size={56} color={getBeltInfo(s.belt)?.bg || "#C41E1E"} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                <Badge belt={s.belt} stripes={s.stripes} size="sm" />
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>Tech {getTechPct(s)}%</span>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>Phys {getPhysPct(s)}%</span>
                </div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, background: "var(--surface2)", color: "var(--accent)" }}>{getOverall(s)}</div>
              <ChevronDown size={18} style={{ transform: selected === s.id ? "rotate(180deg)" : "rotate(0)", transition: "0.2s" }} />
            </div>

            {selected === s.id && (
              <div style={{ borderTop: "1px solid var(--border)" }}>
                <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Select label={t.belt} value={s.belt} onChange={e => handleBeltChange(s.id, "belt", e.target.value)}
                    options={Object.entries(getBeltMap(s.dob)).map(([k, v]) => ({ value: k, label: lang === "ar" ? v.labelAr : v.label }))} />
                  <Select label={t.stripes} value={s.stripes} onChange={e => handleBeltChange(s.id, "stripes", e.target.value)}
                    options={[0,1,2,3,4].map(n => ({ value: n, label: `${n}` }))} />
                </div>
                <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
                  {tabs.map(tb => (
                    <button key={tb.id} onClick={() => setTab(tb.id)} style={{
                      flex: 1, padding: "10px 6px", background: "none", border: "none",
                      borderBottom: tab === tb.id ? "2px solid var(--accent)" : "2px solid transparent",
                      color: tab === tb.id ? "var(--accent)" : "var(--muted)",
                      fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}><tb.Icon size={13} /> {tb.label}</button>
                  ))}
                </div>
                <div style={{ padding: 14 }}>
                  {tab === "fighter" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "center", margin: "0 0 16px" }}>
                        <RadarChart data={s.fighterRatings || {}} size={180} color={getBeltInfo(s.belt)?.bg} />
                      </div>
                      {FIGHTER_ATTRS.map(a => {
                        const val = (s.fighterRatings || {})[a.key] || 0;
                        return (
                          <div key={a.key} style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><a.Icon size={13} /> {t[a.labelKey]}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input
                                  type="number" min={0} max={100}
                                  value={val}
                                  onChange={e => handleFighterChange(s.id, a.key, e.target.value)}
                                  style={{
                                    width: 52, padding: "3px 6px", borderRadius: 6, textAlign: "center",
                                    border: `1.5px solid ${a.color}44`, background: "var(--surface2)",
                                    color: a.color, fontWeight: 800, fontSize: 14, outline: "none",
                                  }}
                                />
                                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>/100</span>
                              </div>
                            </div>
                            <input type="range" min={0} max={100} step={1} value={val}
                              onChange={e => handleFighterChange(s.id, a.key, e.target.value)}
                              style={{ width: "100%", accentColor: a.color, cursor: "pointer" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--muted)", marginTop: 2 }}>
                              <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {tab === "technical" && (() => {
                    const groups = {}; TECHNICAL_ITEMS.forEach(item => { if (!groups[item.group]) groups[item.group] = []; groups[item.group].push(item); });
                    return (
                      <div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12, padding: "6px 10px", background: "var(--surface2)", borderRadius: 6 }}>{t.techEvalNote}</div>
                        {Object.entries(groups).map(([group, items]) => {
                          const filled = items.filter(i => (s.technical || {})[i.key]).length;
                          return (
                            <div key={group}>
                              <GroupHeader label={`${t[group] || group} (${filled}/${items.length})`} collapsed={collapsedGroups[group]} onClick={() => toggleGroup(group)} />
                              {!collapsedGroups[group] && items.map(item => (
                                <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "6px 8px", borderRadius: 6 }}>
                                  <span style={{ flex: 1, fontSize: 12 }}>{itemLabel(item)}</span>
                                  <TechBadge value={(s.technical || {})[item.key]} />
                                  <select value={(s.technical || {})[item.key] || ""} onChange={e => handleTechChange(s.id, item.key, e.target.value)}
                                    style={{ width: 85, padding: "4px 6px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 11 }}>
                                    {TECH_LEVELS.map(l => <option key={l.value} value={l.value}>{l.labelKey ? t[l.labelKey] : "—"}</option>)}
                                  </select>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  {tab === "physical" && (() => {
                    const groups = {}; PHYSICAL_ITEMS.forEach(item => { if (!groups[item.group]) groups[item.group] = []; groups[item.group].push(item); });
                    return (
                      <div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12, padding: "6px 10px", background: "var(--surface2)", borderRadius: 6 }}>{t.physEvalNote}</div>
                        {Object.entries(groups).map(([group, items]) => {
                          const filled = items.filter(i => (s.physical || {})[i.key]).length;
                          return (
                            <div key={group}>
                              <GroupHeader label={`${t[group] || group} (${filled}/${items.length})`} collapsed={collapsedGroups[group]} onClick={() => toggleGroup(group)} />
                              {!collapsedGroups[group] && items.map(item => (
                                <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "6px 8px", borderRadius: 6 }}>
                                  <span style={{ flex: 1, fontSize: 12 }}>{itemLabel(item)}</span>
                                  <input placeholder={item.unit} value={(s.physical || {})[item.key] || ""}
                                    onBlur={e => handlePhysChange(s.id, item.key, e.target.value)}
                                    onChange={e => {/* local only until blur */}}
                                    defaultValue={(s.physical || {})[item.key] || ""}
                                    style={{ width: 70, padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 12, textAlign: "right" }}
                                  />
                                  <span style={{ fontSize: 10, color: "var(--muted)", width: 40, flexShrink: 0 }}>{item.unit}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        ))}
        {students.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>{t.addStudentsFirst}</div>}
      </div>
    </div>
  );
}

// ═══════════════════ FINANCIALS PAGE ═══════════════════

function FinancialsPage({ students, reload }) {
  const { t, lang } = useApp();
  const months = lang === "ar" ? MONTHS_AR : MONTHS_EN;
  const [viewMonth, setViewMonth] = useState(today().substring(0, 7));
  const [invoiceModal, setInvoiceModal] = useState(null);
  const [invForm, setInvForm] = useState({ amount: 0, description: "", date: "" });
  const [invSaving, setInvSaving] = useState(false);

  const allInvoices = useMemo(() => {
    const inv = [];
    students.forEach(s => (s.invoices || []).forEach(i => inv.push({ ...i, studentName: s.name })));
    return inv.sort((a, b) => b.date.localeCompare(a.date));
  }, [students]);

  const openEdit = (inv) => {
    setInvForm({ amount: inv.amount, description: inv.description, date: inv.date });
    setInvoiceModal(inv);
  };

  const handleInvoiceSave = async () => {
    setInvSaving(true);
    try {
      await db.updateInvoice(invoiceModal.id, invForm);
      await reload();
      setInvoiceModal(null);
    } catch (e) { console.error(e); }
    setInvSaving(false);
  };

  const handleInvoiceDelete = async () => {
    if (!confirm(t.deleteInvoice + "?")) return;
    setInvSaving(true);
    try {
      await db.deleteInvoice(invoiceModal.id);
      await reload();
      setInvoiceModal(null);
    } catch (e) { console.error(e); }
    setInvSaving(false);
  };

  const monthlySales = useMemo(() => {
    const map = {};
    allInvoices.forEach(inv => { const m = inv.date.substring(0, 7); map[m] = (map[m] || 0) + inv.amount; });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [allInvoices]);

  const monthInvoices = allInvoices.filter(i => i.date.startsWith(viewMonth));
  const monthTotal = monthInvoices.reduce((s, i) => s + i.amount, 0);
  const totalRevenue = allInvoices.reduce((s, i) => s + i.amount, 0);
  const maxSale = Math.max(...monthlySales.map(([, v]) => v), 1);

  return (
    <div>
      <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>{t.financials}</h2>
      <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 16px" }}>{t.revenueTracking}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ padding: 16, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>{t.totalRevenue}</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{totalRevenue.toLocaleString()} AED</div>
        </div>
        <div style={{ padding: 16, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>{t.invoices}</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{allInvoices.length}</div>
        </div>
      </div>
      {monthlySales.length > 0 && (
        <div style={{ padding: 16, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{t.monthlySales}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100 }}>
            {monthlySales.slice(0, 12).reverse().map(([m, v]) => (
              <div key={m} onClick={() => setViewMonth(m)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <div style={{ fontSize: 8, color: "var(--muted)", fontWeight: 600 }}>{v}</div>
                <div style={{ width: "100%", maxWidth: 30, height: `${(v / maxSale) * 80}px`, minHeight: 4, background: m === viewMonth ? "var(--accent)" : "var(--surface2)", borderRadius: 4, transition: "all 0.2s" }} />
                <div style={{ fontSize: 9, color: "var(--muted)" }}>{months[parseInt(m.split("-")[1]) - 1]}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{t.invoices} — {months[parseInt(viewMonth.split("-")[1]) - 1]} {viewMonth.split("-")[0]}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{monthTotal} AED</span>
      </div>
      <Input type="month" value={viewMonth} onChange={e => setViewMonth(e.target.value)} />
      <div style={{ display: "grid", gap: 6 }}>
        {monthInvoices.map(inv => (
          <div key={inv.id} style={{ padding: "10px 14px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{inv.studentName}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{inv.description}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{inv.date}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#059669", flexShrink: 0 }}>{inv.amount} AED</div>
            <button onClick={() => openEdit(inv)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", padding: 4, borderRadius: 4, flexShrink: 0 }}><Pencil size={14} /></button>
          </div>
        ))}
        {monthInvoices.length === 0 && <div style={{ textAlign: "center", padding: 24, color: "var(--muted)", fontSize: 13 }}>{t.noInvoicesMonth}</div>}
      </div>

      <Modal open={!!invoiceModal} onClose={() => setInvoiceModal(null)} title={t.editInvoice} width={380}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{invoiceModal?.studentName}</div>
        <Input label={t.date} type="date" value={invForm.date} onChange={e => setInvForm({ ...invForm, date: e.target.value })} />
        <Input label={t.amount} type="number" value={invForm.amount} onChange={e => setInvForm({ ...invForm, amount: e.target.value })} />
        <Input label="Description" value={invForm.description} onChange={e => setInvForm({ ...invForm, description: e.target.value })} />
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
          <Btn variant="danger" loading={invSaving} onClick={handleInvoiceDelete} style={{ marginRight: "auto" }}><Trash2 size={13} /> {t.deleteInvoice}</Btn>
          <Btn variant="secondary" onClick={() => setInvoiceModal(null)}>{t.cancel}</Btn>
          <Btn loading={invSaving} onClick={handleInvoiceSave}>{t.save}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════ APP ═══════════════════

const AUTH_KEY = "bjj_auth";

function LoginScreen({ onLogin, theme }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const creds = await db.fetchCredentials();
      if (username.trim().toLowerCase() === creds.username.toLowerCase() && password === creds.password) {
        localStorage.setItem(AUTH_KEY, "1");
        onLogin();
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Login failed: " + (err.message || "unknown error"));
    }
    setSubmitting(false);
  };

  return (
    <div className={theme === "light" ? "theme-light" : ""} style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "var(--bg)", color: "var(--text)", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <form onSubmit={handleSubmit} style={{
        width: "100%", maxWidth: 360, background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: 12, padding: 28,
        boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <img src="/bjj-logo.jpeg" alt="logo" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", marginBottom: 12 }} />
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>Sharjah BJJ Academy</div>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, marginTop: 4 }}>Sign In</div>
        </div>
        <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={submitting} style={{
          width: "100%", padding: "10px 16px", borderRadius: 6, border: "none",
          background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 700,
          cursor: submitting ? "wait" : "pointer", marginTop: 4, opacity: submitting ? 0.7 : 1,
        }}>{submitting ? "Signing in..." : "Sign In"}</button>
      </form>
    </div>
  );
}

function CredentialsModal({ open, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStatus("");
    setBusy(true);
    db.fetchCredentials()
      .then((c) => { setUsername(c.username); setPassword(c.password); })
      .catch((e) => setStatus("Failed to load: " + (e.message || "")))
      .finally(() => setBusy(false));
  }, [open]);

  const handleSave = async () => {
    if (!username.trim() || !password) return;
    setBusy(true);
    try {
      await db.updateCredentials({ username: username.trim(), password });
      setStatus("Saved!");
      setTimeout(() => onClose(), 600);
    } catch (e) {
      setStatus("Save failed: " + (e.message || ""));
    }
    setBusy(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Credentials" width={400}>
      <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={busy} />
      <Input label="Password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} />
      {status && <div style={{ fontSize: 12, color: status.startsWith("Saved") ? "#10b981" : "#ef4444", marginBottom: 8 }}>{status}</div>}
      <button onClick={handleSave} disabled={busy} style={{
        width: "100%", padding: "10px 16px", borderRadius: 6, border: "none",
        background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 700,
        cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1,
      }}>{busy ? "Working..." : "Save"}</button>
    </Modal>
  );
}

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [credsOpen, setCredsOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("students");
  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    setAuthed(localStorage.getItem(AUTH_KEY) === "1");
    setAuthChecked(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  };

  const t = translations[lang];

  const loadData = useCallback(async () => {
    try {
      const data = await db.fetchStudents();
      setStudents(data);
    } catch (e) { console.error("Failed to load:", e); }
    setLoading(false);
  }, []);

  const patchStudent = useCallback((id, updater) => {
    setStudents(prev => prev.map(s => s.id === id ? (typeof updater === "function" ? updater(s) : { ...s, ...updater }) : s));
  }, []);

  useEffect(() => { if (authed) loadData(); }, [loadData, authed]);

  if (!authChecked) return null;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} theme={theme} />;

  const NAV = [
    { id: "students", label: t.students, Icon: Users },
    { id: "attendance", label: t.attend, Icon: ClipboardCheck },
    { id: "progress", label: t.progress, Icon: BarChart3 },
    { id: "financials", label: t.finance, Icon: DollarSign },
  ];

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", color: "#888", background: "#0F0F0F" }}>
      <Loader2 size={24} className="animate-spin" style={{ marginRight: 8 }} /> {t.loading}
    </div>
  );

  return (
    <AppContext.Provider value={{ t, lang, theme }}>
      <div className={theme === "light" ? "theme-light" : ""} style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: "var(--bg)", color: "var(--text)", minHeight: "100vh", maxWidth: 540, margin: "0 auto",
        display: "flex", flexDirection: "column", direction: t.dir,
      }}>
        {/* Header */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/bjj-logo.jpeg" alt="logo" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>{t.appName}</div>
            <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2 }}>{t.appSub}</div>
          </div>
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")} style={{
            background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "var(--text)", fontSize: 11, fontWeight: 600,
          }}><Languages size={14} /> {lang === "en" ? "ع" : "EN"}</button>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{
            background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px",
            cursor: "pointer", display: "flex", alignItems: "center", color: "var(--text)",
          }}>{theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}</button>
          <button onClick={() => setCredsOpen(true)} title="Edit credentials" style={{
            background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px",
            cursor: "pointer", display: "flex", alignItems: "center", color: "var(--text)",
          }}><Lock size={14} /></button>
          <button onClick={handleLogout} title="Logout" style={{
            background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px",
            cursor: "pointer", display: "flex", alignItems: "center", color: "var(--text)",
          }}><LogOut size={14} /></button>
        </div>
        <CredentialsModal open={credsOpen} onClose={() => setCredsOpen(false)} />

        {/* Content */}
        <div style={{ flex: 1, padding: 16, paddingBottom: 80, overflow: "auto" }}>
          {page === "students" && <StudentsPage students={students} reload={loadData} />}
          {page === "attendance" && <AttendancePage students={students} patchStudent={patchStudent} />}
          {page === "progress" && <ProgressPage students={students} patchStudent={patchStudent} />}
          {page === "financials" && <FinancialsPage students={students} reload={loadData} />}
        </div>

        {/* Bottom Nav */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 540, display: "flex", background: "var(--surface)",
          borderTop: "1px solid var(--border)", padding: "6px 0 env(safe-area-inset-bottom, 8px)", zIndex: 100,
        }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "6px 0", background: "none", border: "none", cursor: "pointer",
              color: page === n.id ? "var(--accent)" : "var(--muted)", transition: "color 0.15s",
            }}>
              <n.Icon size={18} />
              <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    </AppContext.Provider>
  );
}
