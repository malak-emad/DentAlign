// src/features/patient/pages/PatientHistory.jsx
import React, { useMemo, useState } from "react";
import styles from "./History.module.css";

/**
 * PatientHistory.jsx
 * - Front-end only (mock data)
 * - Replace mock arrays with API calls (useEffect/fetch) when backend is ready
 */

const MOCK_VISITS = [
  {
    id: "v1",
    date: "2026-01-15",
    time: "11:00",
    doctor: "Dr. Sarah Ahmed",
    reason: "Tooth pain (molar #46)",
    diagnosis: "Deep caries with reversible pulpitis",
    outcome: "Prescription given · X‑Ray requested",
    prescriptionId: 1,
    radiologyId: "r100",
  },
  {
    id: "v2",
    date: "2025-12-02",
    time: "09:30",
    doctor: "Dr. Omar Khaled",
    reason: "Routine cleaning",
    diagnosis: "Gingivitis mild",
    outcome: "Follow‑up in 6 months",
    prescriptionId: null,
    radiologyId: null,
  },
  {
    id: "v3",
    date: "2025-10-10",
    time: "14:00",
    doctor: "Dr. Lina Hassan",
    reason: "Chest X‑Ray (radiology)",
    diagnosis: "Normal",
    outcome: "No action required",
    prescriptionId: null,
    radiologyId: "r101"
  },
];

const MOCK_CONDITIONS = {
  chronic: [
    { id: "c1", name: "Asthma", notes: "Inhaler PRN" },
    { id: "c2", name: "Iron deficiency anemia", notes: "Under observation" },
  ],
  allergies: [
    { id: "a1", name: "Penicillin" },
    { id: "a2", name: "Latex" },
  ],
  surgeries: [
    { id: "s1", name: "Wisdom tooth extraction (lower-right)", date: "2022-08-18" }
  ],
};

const MOCK_RADIO = [
  { id: "r100", type: "Dental X‑Ray", date: "2026-01-15", status: "Completed" },
  { id: "r101", type: "Chest X‑Ray", date: "2025-10-10", status: "Completed" },
];

export default function PatientHistory({
  // optional callbacks if you want parent to handle navigation
  onViewPrescription = (id) => { console.log("view prescription", id); },
  onViewRadiology = (id) => { console.log("view radiology", id); },
}) {
  // Filters
  const [doctorFilter, setDoctorFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Data (replace with fetch in useEffect)
  const visits = MOCK_VISITS;
  const conditions = MOCK_CONDITIONS;
  const radiology = MOCK_RADIO;

  const uniqueDoctors = useMemo(() => {
    return [...new Set(visits.map(v => v.doctor))];
  }, [visits]);

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      if (doctorFilter && v.doctor !== doctorFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (!(
          (v.reason && v.reason.toLowerCase().includes(q)) ||
          (v.diagnosis && v.diagnosis.toLowerCase().includes(q)) ||
          (v.outcome && v.outcome.toLowerCase().includes(q))
        )) return false;
      }
      if (dateFrom && new Date(v.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(v.date) > new Date(dateTo)) return false;
      return true;
    }).sort((a,b) => new Date(b.date) - new Date(a.date)); // newest first
  }, [visits, doctorFilter, searchTerm, dateFrom, dateTo]);

  return (
    <div className={styles.container}>
      {/* Header + Filters */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Medical History</h1>

        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search reason, diagnosis or outcome"
            className={styles.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search history"
          />

          <select
            className={styles.select}
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            aria-label="Filter by doctor"
          >
            <option value="">All Doctors</option>
            {uniqueDoctors.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <input
            type="date"
            className={styles.dateInput}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="From date"
          />
          <input
            type="date"
            className={styles.dateInput}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="To date"
          />
        </div>
      </div>

      <div className={styles.mainGrid}>

        {/* ----------------- LEFT: Visit timeline ----------------- */}
        <section className={styles.timelineCol}>
          <h2 className={styles.sectionTitle}>Visit History</h2>

          {filteredVisits.length === 0 && (
            <div className={styles.empty}>No visits match your filters.</div>
          )}

          <div className={styles.timeline}>
            {filteredVisits.map(visit => (
              <article key={visit.id} className={styles.timelineItem}>
                <div className={styles.timelineDate}>
                  <div className={styles.dateBox}>
                    <div className={styles.dateDay}>{new Date(visit.date).toLocaleDateString()}</div>
                    <div className={styles.dateTime}>{visit.time}</div>
                  </div>
                </div>

                <div className={styles.timelineContent}>
                  <div className={styles.itemHeader}>
                    <div>
                      <div className={styles.itemDoctor}>{visit.doctor}</div>
                      <div className={styles.itemReason}>{visit.reason}</div>
                    </div>
                    <div className={styles.itemTags}>
                      {visit.outcome && <span className={styles.tag}>{visit.outcome.split(" · ")[0]}</span>}
                    </div>
                  </div>

                  <div className={styles.itemBody}>
                    <div className={styles.row}><strong>Diagnosis:</strong> {visit.diagnosis}</div>
                    <div className={styles.row}><strong>Outcome:</strong> {visit.outcome}</div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      className={styles.linkBtn}
                      onClick={() => visit.prescriptionId ? onViewPrescription(visit.prescriptionId) : alert("No prescription for this visit")}
                    >
                      View Prescription
                    </button>

                    <button
                      className={styles.linkBtn}
                      onClick={() => visit.radiologyId ? onViewRadiology(visit.radiologyId) : alert("No radiology for this visit")}
                    >
                      View Radiology
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ----------------- RIGHT: Conditions & Radiology summary ----------------- */}
        <aside className={styles.sideCol}>
          {/* Conditions */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Chronic Conditions</h3>
              <button className={styles.smallEdit}>Edit</button>
            </div>
            <ul className={styles.chips}>
              {conditions.chronic.length === 0 && <li className={styles.chipEmpty}>No known chronic conditions</li>}
              {conditions.chronic.map(c => (
                <li key={c.id} className={styles.chip}>
                  <strong>{c.name}</strong>
                  {c.notes && <div className={styles.chipNote}>{c.notes}</div>}
                </li>
              ))}
            </ul>
          </div>

          {/* Allergies */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Allergies</h3>
              <button className={styles.smallEdit}>Edit</button>
            </div>
            <ul className={styles.chips}>
              {conditions.allergies.length === 0 && <li className={styles.chipEmpty}>No recorded allergies</li>}
              {conditions.allergies.map(a => <li key={a.id} className={styles.allergy}>{a.name}</li>)}
            </ul>
          </div>

          {/* Surgeries */}
          <div className={styles.card}>
            <h3>Past Surgeries</h3>
            <ul className={styles.simpleList}>
              {conditions.surgeries.length === 0 && <li className={styles.empty}>No surgeries recorded</li>}
              {conditions.surgeries.map(s => (
                <li key={s.id}>
                  <div className={styles.surgTitle}>{s.name}</div>
                  <div className={styles.surgDate}>{s.date}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Radiology summary */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Radiology Summary</h3>
            </div>
            <ul className={styles.radiologyList}>
              {radiology.length === 0 && <li className={styles.empty}>No radiology records</li>}
              {radiology.map(r => (
                <li key={r.id} className={styles.radItem}>
                  <div>
                    <div className={styles.radType}>{r.type}</div>
                    <div className={styles.radMeta}>{r.date} • {r.status}</div>
                  </div>
                  <button className={styles.linkBtn} onClick={() => onViewRadiology(r.id)}>View</button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
