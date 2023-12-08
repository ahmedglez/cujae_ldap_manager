const filterLogsByTimeframe = (logs, timeframe) => {
  const now = new Date()

  switch (timeframe) {
    case 'today':
      return logs.filter((log) => isSameDay(new Date(log.timestamp), now))
    case '3days':
      return logs.filter((log) =>
        isWithinNDays(new Date(log.timestamp), now, 3)
      )
    case '5days':
      return logs.filter((log) =>
        isWithinNDays(new Date(log.timestamp), now, 5)
      )
    case 'week':
      return logs.filter((log) => isWithinAWeek(new Date(log.timestamp), now))
    case 'month':
      return logs.filter((log) => isWithinAMonth(new Date(log.timestamp), now))
    default:
      return logs
  }
}

const isSameDay = (date1, date2) =>
  date1.getDate() === date2.getDate() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getFullYear() === date2.getFullYear()

const isWithinNDays = (date, now, n) =>
  Math.abs(date - now) / (1000 * 60 * 60 * 24) <= n

const isWithinAWeek = (date, now) => isWithinNDays(date, now, 7)

const isWithinAMonth = (date, now) => isWithinNDays(date, now, 30)

module.exports = { filterLogsByTimeframe }
