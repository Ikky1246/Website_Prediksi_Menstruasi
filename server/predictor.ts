export interface CyclePrediction {
  cycleStartDate: string;      // YYYY-MM-DD
  cycleEndDate: string;        // YYYY-MM-DD
  ovulationDate: string;       // YYYY-MM-DD
  fertileWindowStart: string;  // YYYY-MM-DD
  fertileWindowEnd: string;    // YYYY-MM-DD
  periodDuration: number;
}

/**
 * Calculates menstrual cycle predictions for a user.
 * Generates the next N cycles of predictions based on the last period start date.
 */
export function generatePredictions(
  lastPeriodStart: string,
  cycleLength: number = 28,
  periodLength: number = 5,
  cyclesToPredict: number = 6
): CyclePrediction[] {
  if (!lastPeriodStart) return [];

  const predictions: CyclePrediction[] = [];
  let currentStart = new Date(lastPeriodStart);

  for (let i = 0; i < cyclesToPredict; i++) {
    // Next cycle start is currentStart + cycleLength
    const nextStart = new Date(currentStart);
    if (i > 0) {
      nextStart.setDate(currentStart.getDate() + cycleLength);
    }

    const nextEnd = new Date(nextStart);
    nextEnd.setDate(nextStart.getDate() + periodLength - 1);

    // Ovulation is usually 14 days before the next next cycle start
    // Or simpler: cycleLength - 14 days after current cycle start
    const ovulation = new Date(nextStart);
    ovulation.setDate(nextStart.getDate() + (cycleLength - 14));

    // Fertile window is 5 days before ovulation up to 1 day after ovulation
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(ovulation.getDate() - 5);

    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(ovulation.getDate() + 1);

    predictions.push({
      cycleStartDate: formatDate(nextStart),
      cycleEndDate: formatDate(nextEnd),
      ovulationDate: formatDate(ovulation),
      fertileWindowStart: formatDate(fertileStart),
      fertileWindowEnd: formatDate(fertileEnd),
      periodDuration: periodLength,
    });

    // Advance for next iteration
    currentStart = nextStart;
  }

  return predictions;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
