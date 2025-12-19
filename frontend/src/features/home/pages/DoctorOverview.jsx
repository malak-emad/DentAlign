import styles from "./DoctorOverview.module.css";
import doctor1 from "../../../assets/images/doctor.jpg";
import doctor2 from "../../../assets/images/doctor2.jpg";
import doctor3 from "../../../assets/images/doctor3.jpg";
import doctor4 from "../../../assets/images/doctor4.jpg";


export default function DoctorOverview() {
  const doctors = [
    {
      name: "Dr. Ahmed Hassan",
      specialty: "Orthodontist",
      image: doctor1,
    },
    {
      name: "Dr. Sara Mahmoud",
      specialty: "Endodontist",
      image: doctor2,
    },
    {
      name: "Dr. Mohamed Ali",
      specialty: "Oral & Maxillofacial Surgeon",
      image: doctor3,
    },
    {
      name: "Dr. Nour El Din",
      specialty: "Pediatric Dentist",
      image: doctor4,
    },
  ];

  return (
    <div className={styles.doctorsPage}>
      {/* Page Title */}
      <div className={styles.doctorsHeader}>
        <h2>Our Doctors</h2>
        <p>
          Meet the experienced specialists behind DentAlign’s high‑quality dental
          care.
        </p>
      </div>

      {/* Doctors Grid */}
      <div className={styles.doctorsGrid}>
        {doctors.map((doc, index) => (
          <div className={styles.doctorCard} key={index}>
            <div className={styles.doctorImageWrap}>
              <img src={doc.image} alt={doc.name} />
            </div>
            <h4>{doc.name}</h4>
            <p>{doc.specialty}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
