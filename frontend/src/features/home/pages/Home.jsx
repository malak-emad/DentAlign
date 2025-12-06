import React, { useEffect, useState, useRef } from "react";
import styles from "./Home.module.css";

import slider1 from "../../../assets/images/slider1.jpg";
import slider2 from "../../../assets/images/slider2.jpg";
import slider3 from "../../../assets/images/slider3.jpg";

import clinic1 from "../../../assets/images/clinic1.jpg";
import clinic2 from "../../../assets/images/clinic2.jpg";
import clinic3 from "../../../assets/images/clinic3.jpg";

import braceIcon from "../../../assets/icons/braces.png";
import cosmeticIcon from "../../../assets/icons/cosmetic.png";
import implantIcon from "../../../assets/icons/implants.png";


export default function Home() {
  const sliderImages = [slider1, slider2, slider3];
  const sliderTexts = [
    "Providing exceptional dental care with precision and comfort.",
    "Your smile is our commitment — advanced dentistry, personal care.",
    "Clinical excellence and compassionate service for every patient."
  ];

  const [index, setIndex] = useState(0);
  const autoRef = useRef(null);

  useEffect(() => {
    startAuto();
    return () => stopAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAuto() {
    stopAuto();
    autoRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % sliderImages.length);
    }, 10000);
  }

  function stopAuto() {
    if (autoRef.current) {
      clearInterval(autoRef.current);
      autoRef.current = null;
    }
  }

  function goPrev() {
    stopAuto();
    setIndex((i) => (i - 1 + sliderImages.length) % sliderImages.length);
    startAuto();
  }

  function goNext() {
    stopAuto();
    setIndex((i) => (i + 1) % sliderImages.length);
    startAuto();
  }

  return (
    <div className={styles.home}>
      {/* HERO - full width */}
      <section className={styles.hero}>
        <div className={styles.slideWrap}>
          {sliderImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Slide ${i + 1}`}
              className={`${styles.heroImage} ${i === index ? styles.active : ""}`}
              draggable={false}
            />
          ))}

          {/* overlay text bar */}
          <div className={styles.heroOverlay}>
            <p>{sliderTexts[index]}</p>
          </div>

          {/* arrows overlayed on image */}
          <button
            aria-label="Previous slide"
            className={`${styles.arrow} ${styles.left}`}
            onClick={goPrev}
          >
            ‹
          </button>
          <button
            aria-label="Next slide"
            className={`${styles.arrow} ${styles.right}`}
            onClick={goNext}
          >
            ›
          </button>
        </div>
      </section>

      {/* ABOUT + CLINIC GALLERY */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutLeft}>
          <h2>About DentAlign Clinic</h2>
          <p className={styles.aboutText}>
            DentAlign Clinic delivers modern dental care combining clinical 
            excellence, evidence-based procedures and a patient-centered 
            approach. We focus on long-term oral health and functional, 
            esthetic results by using advanced technology and a highly 
            trained professional team who treat every patient with respect 
            and empathy. Our services range from preventive care and orthodontics 
            to implants, cosmetic dentistry and restorative treatments — all tailored to your needs.
            We strive to make every visit comfortable and stress-free, 
            ensuring that patients feel supported from consultation to treatment. 
            Our team listens carefully to your concerns and designs personalized 
            care plans that prioritize your comfort, safety, and long-term results. 
            At DentAlign, your smile, confidence, and well-being always come first.
          </p>
        </div>

        <div className={styles.aboutRight}>
          <div className={styles.bigImageWrap}>
            <img src={clinic1} alt="Clinic main" />
          </div>

          <div className={styles.smallImages}>
            <img src={clinic2} alt="Clinic 2" />
            <img src={clinic3} alt="Clinic 3" />
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className={styles.specialties}>
        <h3>Our Specialties</h3>
        <div className={styles.specGrid}>
          <div className={styles.specCard}>
            <div className={styles.iconPlaceholder}>
              <img src={braceIcon} alt="Orthodontics" />
            </div>
            <h4>Orthodontics</h4>
            <p>Comprehensive treatments for straighter teeth and improved bite.</p>
          </div>

          <div className={styles.specCard}>
            <div className={styles.iconPlaceholder}>
              <img src={cosmeticIcon} alt="Cosmetic Dentistry" />
            </div>
            <h4>Cosmetic Dentistry</h4>
            <p>Veneers, whitening and smile design to enhance aesthetics.</p>
          </div>

          <div className={styles.specCard}>
            <div className={styles.iconPlaceholder}>
              <img src={implantIcon} alt="Dental Implants" />
            </div>
            <h4>Dental Implants</h4>
            <p>Long-lasting implant solutions to replace missing teeth.</p>
          </div>

        </div>
      </section>
    </div>
  );
}
