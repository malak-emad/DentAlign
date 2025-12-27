import React, { useEffect, useState, useRef } from "react";
import styles from "./VisitTimer.module.css";

export default function VisitTimer({ onTick }) {
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const onTickRef = useRef(onTick);

  // Update ref when onTick changes
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setSeconds((s) => {
        const newSeconds = s + 1;
        onTickRef.current(newSeconds);
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paused]);

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className={styles.card}>
      <h3>Visit Timer</h3>
      <div className={styles.time}>{formatTime(seconds)}</div>

        <button
        className={styles.pauseBtn}
        onClick={() => setPaused(!paused)}
        >
        {paused ? "Resume" : "Pause"}
        </button>

    </div>
  );
}
