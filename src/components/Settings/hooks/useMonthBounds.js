import { useMemo } from 'react';

const STEP_MINUTES = 30;

const formatDateForInput = (date) => {
  const pad = (number) => String(number).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const roundDownToStep = (date, stepMinutes = STEP_MINUTES) => {
  const rounded = new Date(date.getTime());
  const remainder = rounded.getMinutes() % stepMinutes;
  if (remainder !== 0) {
    rounded.setMinutes(rounded.getMinutes() - remainder);
  }
  rounded.setSeconds(0, 0);
  return rounded;
};

const createCurrentMonthBounds = () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const rawMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const monthEnd = roundDownToStep(rawMonthEnd);

  return {
    monthStart,
    monthEnd,
    minValue: formatDateForInput(monthStart),
    maxValue: formatDateForInput(monthEnd)
  };
};

export const useMonthBounds = () => {
  const monthBounds = useMemo(() => createCurrentMonthBounds(), []);
  return monthBounds;
};

