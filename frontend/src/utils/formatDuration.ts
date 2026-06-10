const MINUTE_SECONDS = 60
const HOUR_SECONDS = 60 * MINUTE_SECONDS
const DAY_SECONDS = 24 * HOUR_SECONDS
const MONTH_SECONDS = 30 * DAY_SECONDS
const YEAR_SECONDS = 365 * DAY_SECONDS

function formatUnit(value: number, unit: string) {
  return `${value} ${unit}${value === 1 ? '' : 's'}`
}

export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, totalSeconds)

  if (seconds < MINUTE_SECONDS) {
    return 'Less than a minute'
  }

  if (seconds < HOUR_SECONDS) {
    return formatUnit(Math.floor(seconds / MINUTE_SECONDS), 'minute')
  }

  if (seconds < DAY_SECONDS) {
    return formatUnit(Math.floor(seconds / HOUR_SECONDS), 'hour')
  }

  if (seconds < MONTH_SECONDS) {
    return formatUnit(Math.floor(seconds / DAY_SECONDS), 'day')
  }

  if (seconds < YEAR_SECONDS) {
    return formatUnit(Math.floor(seconds / MONTH_SECONDS), 'month')
  }

  return formatUnit(Math.floor(seconds / YEAR_SECONDS), 'year')
}
