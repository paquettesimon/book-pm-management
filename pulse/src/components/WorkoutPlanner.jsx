import React, { useState, useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { v4 as uuidv4 } from 'uuid';
import { tokens } from '../theme';
import WORKOUTS, { CATEGORIES, INTENSITY_PREFS, LOCATION_PREFS } from '../data/workouts';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const CATEGORY_ICONS = {
  strength: FitnessCenterIcon,
  cardio: DirectionsRunIcon,
  flexibility: SelfImprovementIcon,
};

// ---------------------------------------------------------------------------
// Recommendation engine
// Inputs: availableMinutes, category, intensity, location
// Rule: never recommend a workout whose duration exceeds available time.
//       Filter by preferences, then sort by best fit (longest that fits).
// ---------------------------------------------------------------------------
function recommend(availableMinutes, prefs) {
  if (!availableMinutes || availableMinutes <= 0) return [];

  let candidates = WORKOUTS.filter((w) => w.durationMin <= availableMinutes);

  if (prefs.category !== 'any') {
    candidates = candidates.filter((w) => w.category === prefs.category);
  }
  if (prefs.intensity !== 'any') {
    candidates = candidates.filter((w) => w.intensity === prefs.intensity);
  }
  if (prefs.location !== 'any') {
    candidates = candidates.filter((w) => w.location === prefs.location);
  }

  // Sort by duration descending (best use of available time), then by intensity match
  return candidates.sort((a, b) => b.durationMin - a.durationMin);
}

// Check if a time range [start, end] on a given day overlaps any commitment
function hasConflict(day, start, end, commitments) {
  return commitments.filter((c) => {
    if (c.day !== day) return false;
    return start < c.end && end > c.start;
  });
}

function formatTime(minStr) {
  const [h, m] = minStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

function durationLabel(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function WorkoutPlanner({ schedule, onAddAvailability, onRemoveAvailability, onAddCommitment, onRemoveCommitment }) {
  const [availDay, setAvailDay] = useState(1);
  const [availStart, setAvailStart] = useState('07:00');
  const [availEnd, setAvailEnd] = useState('08:00');
  const [commitDay, setCommitDay] = useState(1);
  const [commitStart, setCommitStart] = useState('09:00');
  const [commitEnd, setCommitEnd] = useState('10:00');
  const [commitLabel, setCommitLabel] = useState('');
  const [selectedAvail, setSelectedAvail] = useState(null);
  const [prefs, setPrefs] = useState({ category: 'any', intensity: 'any', location: 'any' });
  const [feedback, setFeedback] = useState({});
  const [error, setError] = useState('');

  const { availability, commitments } = schedule;

  // Compute available minutes for the selected availability block
  const availableMinutes = useMemo(() => {
    if (!selectedAvail) return 0;
    const [sh, sm] = selectedAvail.start.split(':').map(Number);
    const [eh, em] = selectedAvail.end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }, [selectedAvail]);

  // Check for conflicts on the selected availability block
  const conflicts = useMemo(() => {
    if (!selectedAvail) return [];
    return hasConflict(selectedAvail.day, selectedAvail.start, selectedAvail.end, commitments);
  }, [selectedAvail, commitments]);

  // Get recommendations
  const recommendations = useMemo(() => {
    if (!selectedAvail || availableMinutes <= 0) return [];
    return recommend(availableMinutes, prefs);
  }, [selectedAvail, availableMinutes, prefs]);

  // Validate availability block before adding
  const handleAddAvailability = useCallback(() => {
    if (availStart >= availEnd) {
      setError('End time must be after start time.');
      return;
    }
    setError('');
    onAddAvailability({
      id: uuidv4(),
      day: availDay,
      start: availStart,
      end: availEnd,
    });
  }, [availDay, availStart, availEnd, onAddAvailability]);

  const handleAddCommitment = useCallback(() => {
    if (commitStart >= commitEnd) {
      setError('Commitment end time must be after start time.');
      return;
    }
    if (!commitLabel.trim()) {
      setError('Please name your commitment (e.g. "Calculus class").');
      return;
    }
    setError('');
    onAddCommitment({
      id: uuidv4(),
      day: commitDay,
      start: commitStart,
      end: commitEnd,
      label: commitLabel.trim(),
    });
    setCommitLabel('');
  }, [commitDay, commitStart, commitEnd, commitLabel, onAddCommitment]);

  const handleFeedback = useCallback((workoutId, rating) => {
    setFeedback((prev) => ({ ...prev, [workoutId]: rating }));
  }, []);

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', px: 2, py: 3 }}>
      <Typography variant="h5" sx={{ fontSize: '1.2rem', mb: 0.5 }}>
        Workout Planner
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tell us when you're free. We'll suggest a workout that fits your time.
      </Typography>

      {/* ---- Availability section ---- */}
      <Card sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 3, pt: 3 }}>
          <AccessTimeIcon sx={{ color: 'primary.light', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontSize: '0.85rem' }}>
            Your Availability
          </Typography>
        </Box>
        <Box sx={{ px: 3, pb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Day"
              value={availDay}
              onChange={(e) => setAvailDay(Number(e.target.value))}
              size="small"
              sx={{ flex: '1 1 120px' }}
              id="avail-day"
            >
              {DAYS.map((d) => (
                <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="From"
              type="time"
              value={availStart}
              onChange={(e) => setAvailStart(e.target.value)}
              size="small"
              sx={{ flex: '1 1 100px' }}
              slotProps={{ inputLabel: { shrink: true } }}
              id="avail-start"
            />
            <TextField
              label="To"
              type="time"
              value={availEnd}
              onChange={(e) => setAvailEnd(e.target.value)}
              size="small"
              sx={{ flex: '1 1 100px' }}
              slotProps={{ inputLabel: { shrink: true } }}
              id="avail-end"
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddAvailability}
            id="add-availability-button"
            sx={{ alignSelf: 'flex-start' }}
          >
            Add availability
          </Button>

          {/* Existing availability blocks */}
          {availability.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
              {availability.map((a) => {
                const dayLabel = DAYS.find((d) => d.value === a.day)?.label ?? '';
                const isSelected = selectedAvail?.id === a.id;
                return (
                  <Tooltip key={a.id} title="Click to get recommendations for this time block">
                    <Chip
                      label={`${dayLabel} ${formatTime(a.start)} – ${formatTime(a.end)}`}
                      onClick={() => setSelectedAvail(isSelected ? null : a)}
                      onDelete={() => {
                        onRemoveAvailability(a.id);
                        if (isSelected) setSelectedAvail(null);
                      }}
                      deleteIcon={<DeleteIcon />}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      id={`availability-chip-${a.id}`}
                      sx={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.75rem' }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          )}
        </Box>
      </Card>

      {/* ---- Commitments section ---- */}
      <Card sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 3, pt: 3 }}>
          <EventBusyIcon sx={{ color: 'primary.light', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontSize: '0.85rem' }}>
            Commitments
          </Typography>
        </Box>
        <Box sx={{ px: 3, pb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            Add classes, work shifts, or other fixed commitments so we can avoid suggesting workouts that overlap them.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Day"
              value={commitDay}
              onChange={(e) => setCommitDay(Number(e.target.value))}
              size="small"
              sx={{ flex: '1 1 120px' }}
              id="commit-day"
            >
              {DAYS.map((d) => (
                <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="From"
              type="time"
              value={commitStart}
              onChange={(e) => setCommitStart(e.target.value)}
              size="small"
              sx={{ flex: '1 1 100px' }}
              slotProps={{ inputLabel: { shrink: true } }}
              id="commit-start"
            />
            <TextField
              label="To"
              type="time"
              value={commitEnd}
              onChange={(e) => setCommitEnd(e.target.value)}
              size="small"
              sx={{ flex: '1 1 100px' }}
              slotProps={{ inputLabel: { shrink: true } }}
              id="commit-end"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              label="What is it? (e.g. Calculus class)"
              value={commitLabel}
              onChange={(e) => setCommitLabel(e.target.value)}
              size="small"
              sx={{ flex: '1 1 220px' }}
              id="commit-label"
            />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddCommitment}
              id="add-commitment-button"
            >
              Add
            </Button>
          </Box>

          {/* Existing commitments */}
          {commitments.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
              {commitments.map((c) => {
                const dayLabel = DAYS.find((d) => d.value === c.day)?.label ?? '';
                return (
                  <Chip
                    key={c.id}
                    label={`${c.label} · ${dayLabel} ${formatTime(c.start)}–${formatTime(c.end)}`}
                    onDelete={() => onRemoveCommitment(c.id)}
                    deleteIcon={<DeleteIcon />}
                    variant="outlined"
                    id={`commitment-chip-${c.id}`}
                    sx={{ fontSize: '0.75rem', borderColor: 'divider', color: 'text.secondary' }}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      </Card>

      {/* ---- Error message ---- */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} id="planner-error">
          {error}
        </Alert>
      )}

      {/* ---- Preferences + Recommendations ---- */}
      {selectedAvail && (
        <Card sx={{ mb: 2 }}>
          <Box sx={{ px: 3, pt: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FitnessCenterIcon sx={{ color: 'primary.light', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontSize: '0.85rem' }}>
                Recommendations
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ mb: 1 }}>
              {durationLabel(availableMinutes)} available on{' '}
              {DAYS.find((d) => d.value === selectedAvail.day)?.label}{' '}
              {formatTime(selectedAvail.start)} – {formatTime(selectedAvail.end)}
            </Typography>

            {/* Conflict warning */}
            {conflicts.length > 0 && (
              <Alert
                severity="warning"
                icon={<WarningAmberIcon />}
                sx={{ mb: 2, fontSize: '0.8rem' }}
                id="conflict-warning"
              >
                This time block overlaps with: {conflicts.map((c) => c.label).join(', ')}. The recommended workout fits within the remaining free time, but consider adjusting your availability.
              </Alert>
            )}

            {/* Preference filters */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <ToggleButtonGroup
                value={prefs.category}
                exclusive
                onChange={(_, v) => v && setPrefs((p) => ({ ...p, category: v }))}
                size="small"
                aria-label="Workout category"
              >
                {CATEGORIES.map((c) => (
                  <ToggleButton
                    key={c.value}
                    value={c.value}
                    id={`pref-category-${c.value}`}
                    sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: '"Space Grotesk", sans-serif', px: 1.5, '&.Mui-selected': { backgroundColor: tokens.accentDim15, color: tokens.violetBright } }}
                  >
                    {c.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <TextField
                select
                label="Intensity"
                value={prefs.intensity}
                onChange={(e) => setPrefs((p) => ({ ...p, intensity: e.target.value }))}
                size="small"
                sx={{ flex: '1 1 130px' }}
                id="pref-intensity"
              >
                {INTENSITY_PREFS.map((i) => (
                  <MenuItem key={i.value} value={i.value}>{i.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Location"
                value={prefs.location}
                onChange={(e) => setPrefs((p) => ({ ...p, location: e.target.value }))}
                size="small"
                sx={{ flex: '1 1 130px' }}
                id="pref-location"
              >
                {LOCATION_PREFS.map((l) => (
                  <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                ))}
              </TextField>
            </Box>

            {/* No recommendations fallback */}
            {recommendations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <InfoIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                <Typography variant="body2" color="text.secondary" id="no-recommendations">
                  {availableMinutes < 10
                    ? `You have ${availableMinutes} minutes — that's too short for a full workout. Even a 10-minute stretch counts!`
                    : 'No workouts match your filters for this time window. Try widening your preferences.'}
                </Typography>
              </Box>
            ) : (
              /* Recommendation list */
              <List disablePadding>
                {recommendations.map((w, idx) => {
                  const Icon = CATEGORY_ICONS[w.category] ?? FitnessCenterIcon;
                  const isTop = idx === 0;
                  return (
                    <React.Fragment key={w.id}>
                      {idx > 0 && <Divider sx={{ borderColor: tokens.accentDim12 }} />}
                      <ListItem
                        id={`workout-rec-${w.id}`}
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          py: 2,
                          backgroundColor: isTop ? tokens.accentDim08 : 'transparent',
                          borderRadius: isTop ? 2 : 0,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                            <Icon sx={{ color: 'primary.light', fontSize: 22 }} />
                          </ListItemIcon>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {w.name}
                              </Typography>
                              {isTop && (
                                <Chip
                                  label="Best fit"
                                  size="small"
                                  color="primary"
                                  sx={{ fontSize: '0.65rem', height: 20, fontWeight: 600 }}
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                              {w.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                              <Chip label={durationLabel(w.durationMin)} size="small" variant="outlined" sx={{ fontSize: '0.7rem', borderColor: tokens.borderViolet }} />
                              <Chip label={w.intensity} size="small" variant="outlined" sx={{ fontSize: '0.7rem', borderColor: 'divider', textTransform: 'capitalize' }} />
                              <Chip label={w.location} size="small" variant="outlined" sx={{ fontSize: '0.7rem', borderColor: 'divider', textTransform: 'capitalize' }} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.78rem' }}>
                              {w.activities.join(' · ')}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Feedback row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, pl: 5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Useful?
                          </Typography>
                          <Button
                            size="small"
                            variant={feedback[w.id] === 'up' ? 'contained' : 'outlined'}
                            onClick={() => handleFeedback(w.id, 'up')}
                            id={`feedback-up-${w.id}`}
                            sx={{ minWidth: 0, px: 1, fontSize: '0.72rem' }}
                          >
                            Yes
                          </Button>
                          <Button
                            size="small"
                            variant={feedback[w.id] === 'down' ? 'contained' : 'outlined'}
                            color="error"
                            onClick={() => handleFeedback(w.id, 'down')}
                            id={`feedback-down-${w.id}`}
                            sx={{ minWidth: 0, px: 1, fontSize: '0.72rem' }}
                          >
                            No
                          </Button>
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </Box>
        </Card>
      )}

      {/* ---- Empty state when no availability selected ---- */}
      {!selectedAvail && availability.length === 0 && (
        <Card sx={{ mb: 2 }}>
          <Box sx={{ textAlign: 'center', py: 5, px: 3 }}>
            <AccessTimeIcon sx={{ fontSize: 56, color: 'primary.light', opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
              Add your first availability block
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
              Pick a day and time when you're free, then we'll suggest a workout that fits.
            </Typography>
          </Box>
        </Card>
      )}

      {!selectedAvail && availability.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <Box sx={{ textAlign: 'center', py: 5, px: 3 }}>
            <FitnessCenterIcon sx={{ fontSize: 56, color: 'primary.light', opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1 }}>
              Select an availability block above
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
              Click on one of your free time blocks to see workout recommendations.
            </Typography>
          </Box>
        </Card>
      )}

      {/* ---- Trust note ---- */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: 1 }}>
        <InfoIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.25, flexShrink: 0 }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.72rem', lineHeight: 1.5 }}>
          Durations are estimates, not guarantees. This tool does not show live gym availability and is not medical advice.
        </Typography>
      </Box>
    </Box>
  );
}
