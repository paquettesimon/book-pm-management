import { useState, useCallback } from 'react';

const STORAGE_KEY = 'pulse.schedule';

/**
 * Manages the student's schedule data in localStorage.
 * Stores availability windows and commitments separately so the
 * planner can validate against both.
 *
 * Availability: { id, day, start, end }  — a free time block
 * Commitment:  { id, day, start, end, label } — a fixed commitment (class, work, etc.)
 *
 * day: 0–6 (Sunday–Saturday)
 * start/end: "HH:MM" 24-hour strings
 */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted — fall through to empty
  }
  return { availability: [], commitments: [] };
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function useSchedule() {
  const [state, setState] = useState(load);

  const update = useCallback((next) => {
    setState(next);
    save(next);
  }, []);

  const addAvailability = useCallback((block) => {
    setState((prev) => {
      const next = {
        ...prev,
        availability: [...prev.availability, block],
      };
      save(next);
      return next;
    });
  }, []);

  const removeAvailability = useCallback((id) => {
    setState((prev) => {
      const next = {
        ...prev,
        availability: prev.availability.filter((a) => a.id !== id),
      };
      save(next);
      return next;
    });
  }, []);

  const addCommitment = useCallback((block) => {
    setState((prev) => {
      const next = {
        ...prev,
        commitments: [...prev.commitments, block],
      };
      save(next);
      return next;
    });
  }, []);

  const removeCommitment = useCallback((id) => {
    setState((prev) => {
      const next = {
        ...prev,
        commitments: prev.commitments.filter((c) => c.id !== id),
      };
      save(next);
      return next;
    });
  }, []);

  return {
    availability: state.availability,
    commitments: state.commitments,
    addAvailability,
    removeAvailability,
    addCommitment,
    removeCommitment,
  };
}
