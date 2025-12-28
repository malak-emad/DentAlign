// src/features/patient/pages/PatientHistory.jsx
import React, { useMemo, useState, useEffect } from "react";
import { patientApi } from "../api/patientApi";
import styles from "./History.module.css";

export default function PatientHistory({
  // optional callbacks if you want parent to handle navigation
  onViewPrescription = (id) => { console.log("view prescription", id); },
  onViewRadiology = (id) => { console.log("view radiology", id); },
}) {
  // State for API data
  const [visits, setVisits] = useState([]);
  const [conditions, setConditions] = useState({ chronic: [], allergies: [], surgeries: [] });
  const [radiology, setRadiology] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [doctorFilter, setDoctorFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Medical history editing state
  const [editingSection, setEditingSection] = useState(null); // 'chronic', 'allergies', 'surgeries'
  const [editingItem, setEditingItem] = useState(null); // item being edited
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch medical history data
  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        setLoading(true);
        const data = await patientApi.getMedicalHistory();
        setVisits(data.visits || []);
        setRadiology(data.radiology || []);
        setConditions(data.conditions || { chronic: [], allergies: [], surgeries: [] });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch medical history:', err);
        setError('Failed to load medical history');
        // Keep mock data as fallback
        setVisits([]);
        setRadiology([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, []);

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

  // Medical history editing functions
  const startEditing = (section, item = null) => {
    setEditingSection(section);
    setEditingItem(item);
    setShowAddForm(false);
    if (item) {
      setFormData({ ...item });
    } else {
      setFormData({});
    }
  };

  const startAdding = (section) => {
    setEditingSection(section);
    setEditingItem(null);
    setFormData({});
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditingItem(null);
    setShowAddForm(false);
    setFormData({});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let result;
      if (editingItem) {
        // Update existing item
        switch (editingSection) {
          case 'chronic':
            result = await patientApi.updateChronicCondition(editingItem.condition_id, formData);
            break;
          case 'allergies':
            result = await patientApi.updateAllergy(editingItem.allergy_id, formData);
            break;
          case 'surgeries':
            result = await patientApi.updatePastSurgery(editingItem.surgery_id, formData);
            break;
        }
      } else {
        // Create new item
        switch (editingSection) {
          case 'chronic':
            result = await patientApi.createChronicCondition(formData);
            break;
          case 'allergies':
            result = await patientApi.createAllergy(formData);
            break;
          case 'surgeries':
            result = await patientApi.createPastSurgery(formData);
            break;
        }
      }
      
      // Refresh data
      const data = await patientApi.getMedicalHistory();
      setConditions(data.conditions || { chronic: [], allergies: [], surgeries: [] });
      cancelEditing();
    } catch (error) {
      console.error('Failed to save:', error);
      if (error.message.includes('Resource not found') || error.message.includes('404')) {
        // Item may have been deleted, refresh data
        try {
          const data = await patientApi.getMedicalHistory();
          setConditions(data.conditions || { chronic: [], allergies: [], surgeries: [] });
          cancelEditing();
          alert('The item you were editing is no longer available. The data has been refreshed.');
        } catch (refreshError) {
          alert('Failed to save changes and unable to refresh data. Please reload the page.');
        }
      } else {
        alert('Failed to save changes. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      switch (editingSection) {
        case 'chronic':
          await patientApi.deleteChronicCondition(item.condition_id);
          break;
        case 'allergies':
          await patientApi.deleteAllergy(item.allergy_id);
          break;
        case 'surgeries':
          await patientApi.deletePastSurgery(item.surgery_id);
          break;
      }
      
      // Refresh data
      const data = await patientApi.getMedicalHistory();
      setConditions(data.conditions || { chronic: [], allergies: [], surgeries: [] });
      cancelEditing();
    } catch (error) {
      console.error('Failed to delete:', error);
      if (error.message.includes('Resource not found') || error.message.includes('404')) {
        // Item may have already been deleted, refresh data
        try {
          const data = await patientApi.getMedicalHistory();
          setConditions(data.conditions || { chronic: [], allergies: [], surgeries: [] });
          cancelEditing();
          alert('The item has been deleted. The data has been refreshed.');
        } catch (refreshError) {
          alert('Failed to delete item and unable to refresh data. Please reload the page.');
        }
      } else {
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading medical history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header + Filters */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Medical History</h1>

        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search visits by reason, diagnosis or outcome"
            className={styles.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search visits"
          />

          <select
            className={styles.select}
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            aria-label="Filter visits by doctor"
          >
            <option value="">All Doctors</option>
            {uniqueDoctors.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <input
            type="date"
            className={styles.dateInput}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="Visits from"
            aria-label="Filter visits from this date"
          />
          <input
            type="date"
            className={styles.dateInput}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="Visits to"
            aria-label="Filter visits until this date"
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
                      {visit.radiology_needed && <span className={styles.tag}>X-Ray</span>}
                    </div>
                  </div>

                  <div className={styles.itemBody}>
                    <div className={styles.row}><strong>Diagnosis:</strong> {visit.diagnosis}</div>
                    <div className={styles.row}><strong>Outcome:</strong> {visit.outcome}</div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      className={styles.linkBtn}
                      onClick={() => onViewPrescription(visit.id)}
                    >
                      View Prescription
                    </button>

                    {visit.radiology_needed && (
                      <button
                        className={styles.linkBtn}
                        onClick={() => onViewRadiology(visit.id)}
                      >
                        View Radiology
                      </button>
                    )}
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
              <button 
                className={styles.smallEdit}
                onClick={() => startAdding('chronic')}
              >
                Add
              </button>
            </div>
            
            {editingSection === 'chronic' ? (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    placeholder="Condition name"
                    value={formData.condition_name || ''}
                    onChange={(e) => setFormData({...formData, condition_name: e.target.value})}
                    className={styles.formInput}
                  />
                  <textarea
                    placeholder="Notes (optional)"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className={styles.formTextarea}
                    rows="2"
                  />
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className={styles.formSelect}
                  >
                    <option value="active">Active</option>
                    <option value="managed">Managed</option>
                    <option value="resolved">Resolved</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div className={styles.formActions}>
                  <button 
                    onClick={handleSave}
                    disabled={saving || !formData.condition_name}
                    className={styles.saveBtn}
                  >
                    {saving ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                  </button>
                  {editingItem && (
                    <button 
                      onClick={() => handleDelete(editingItem)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  )}
                  <button onClick={cancelEditing} className={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <ul className={styles.chips}>
                {conditions.chronic.length === 0 && <li className={styles.chipEmpty}>No known chronic conditions</li>}
                {conditions.chronic.map(c => (
                  <li key={c.condition_id} className={styles.chip}>
                    <div className={styles.chipContent}>
                      <div>
                        <strong>{c.condition_name}</strong>
                        {c.notes && <div className={styles.chipNote}>{c.notes}</div>}
                        {c.status && <div className={styles.chipNote}>Status: {c.status}</div>}
                      </div>
                      <button 
                        className={styles.itemEditBtn}
                        onClick={() => startEditing('chronic', c)}
                        title="Edit this condition"
                      >
                        ✏️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Allergies */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Allergies</h3>
              <button 
                className={styles.smallEdit}
                onClick={() => startAdding('allergies')}
              >
                Add
              </button>
            </div>
            
            {editingSection === 'allergies' ? (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    placeholder="Allergen name"
                    value={formData.allergen_name || ''}
                    onChange={(e) => setFormData({...formData, allergen_name: e.target.value})}
                    className={styles.formInput}
                  />
                  <select
                    value={formData.severity || 'mild'}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    className={styles.formSelect}
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="life-threatening">Life-threatening</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Reaction description"
                    value={formData.reaction || ''}
                    onChange={(e) => setFormData({...formData, reaction: e.target.value})}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formActions}>
                  <button 
                    onClick={handleSave}
                    disabled={saving || !formData.allergen_name}
                    className={styles.saveBtn}
                  >
                    {saving ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                  </button>
                  {editingItem && (
                    <button 
                      onClick={() => handleDelete(editingItem)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  )}
                  <button onClick={cancelEditing} className={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <ul className={styles.chips}>
                {conditions.allergies.length === 0 && <li className={styles.chipEmpty}>No recorded allergies</li>}
                {conditions.allergies.map(a => (
                  <li key={a.allergy_id} className={styles.allergy}>
                    <div className={styles.chipContent}>
                      <div>
                        <strong>{a.allergen_name}</strong>
                        {a.severity && <div className={styles.chipNote}>Severity: {a.severity}</div>}
                        {a.reaction && <div className={styles.chipNote}>Reaction: {a.reaction}</div>}
                      </div>
                      <button 
                        className={styles.itemEditBtn}
                        onClick={() => startEditing('allergies', a)}
                        title="Edit this allergy"
                      >
                        ✏️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Surgeries */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Past Surgeries</h3>
              <button 
                className={styles.smallEdit}
                onClick={() => startAdding('surgeries')}
              >
                Add
              </button>
            </div>
            
            {editingSection === 'surgeries' ? (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    placeholder="Procedure name"
                    value={formData.procedure_name || ''}
                    onChange={(e) => setFormData({...formData, procedure_name: e.target.value})}
                    className={styles.formInput}
                  />
                  <input
                    type="date"
                    value={formData.surgery_date || ''}
                    onChange={(e) => setFormData({...formData, surgery_date: e.target.value})}
                    className={styles.formInput}
                  />
                  <input
                    type="text"
                    placeholder="Surgeon name"
                    value={formData.surgeon || ''}
                    onChange={(e) => setFormData({...formData, surgeon: e.target.value})}
                    className={styles.formInput}
                  />
                  <input
                    type="text"
                    placeholder="Hospital/Clinic"
                    value={formData.hospital || ''}
                    onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                    className={styles.formInput}
                  />
                  <textarea
                    placeholder="Notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className={styles.formTextarea}
                    rows="2"
                  />
                  <textarea
                    placeholder="Complications (if any)"
                    value={formData.complications || ''}
                    onChange={(e) => setFormData({...formData, complications: e.target.value})}
                    className={styles.formTextarea}
                    rows="2"
                  />
                </div>
                <div className={styles.formActions}>
                  <button 
                    onClick={handleSave}
                    disabled={saving || !formData.procedure_name}
                    className={styles.saveBtn}
                  >
                    {saving ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                  </button>
                  {editingItem && (
                    <button 
                      onClick={() => handleDelete(editingItem)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  )}
                  <button onClick={cancelEditing} className={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <ul className={styles.chips}>
                {conditions.surgeries.length === 0 && <li className={styles.chipEmpty}>No recorded surgeries</li>}
                {conditions.surgeries.map(s => (
                  <li key={s.surgery_id} className={styles.surgery}>
                    <div className={styles.chipContent}>
                      <div>
                        <strong>{s.procedure_name}</strong>
                        {s.surgery_date && <div className={styles.chipNote}>Date: {new Date(s.surgery_date).toLocaleDateString()}</div>}
                        {s.surgeon && <div className={styles.chipNote}>Surgeon: {s.surgeon}</div>}
                        {s.hospital && <div className={styles.chipNote}>Hospital: {s.hospital}</div>}
                        {s.notes && <div className={styles.chipNote}>Notes: {s.notes}</div>}
                        {s.complications && <div className={styles.chipNote}>Complications: {s.complications}</div>}
                      </div>
                      <button 
                        className={styles.itemEditBtn}
                        onClick={() => startEditing('surgeries', s)}
                        title="Edit this surgery"
                      >
                        ✏️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
