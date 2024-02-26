const { parseISO, format } = require("date-fns");

function groupByDay(data) {
  const groupedData = {};

  // Group entries by day
  data.forEach((e) => {
    const entryTime = parseISO(e.date_time);
    const key = entryTime.toISOString().split("T")[0]; // Get date part only
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(e);
  });

  return groupedData;
}

function summarizeForecast(data) {
  const groupedByDay = groupByDay(data);

  const summaries = {};

  // Process each day
  Object.keys(groupedByDay).forEach((day) => {
    const entries = groupedByDay[day];
    const tempMorning = [];
    const rainMorning = [];
    const tempAfternoon = [];
    const rainAfternoon = [];
    const tempAll = entries.map((entry) => entry.average_temperature);

    entries.forEach((entry) => {
      const entryTime = parseISO(entry.date_time);
      const hour = entryTime.getHours();
      // Collect morning period entries
      if (6 <= hour && hour < 12) {
        tempMorning.push(entry.average_temperature);
        rainMorning.push(entry.probability_of_rain);
      }
      // Collect afternoon period entries
      else if (12 <= hour && hour < 18) {
        tempAfternoon.push(entry.average_temperature);
        rainAfternoon.push(entry.probability_of_rain);
      }
    });

    const summary = {
      // If no morning data, report insufficient data
      morning_average_temperature:
        tempMorning.length === 0
          ? "Insufficient forecast data"
          : Math.round(
              tempMorning.reduce((a, b) => a + b, 0) / tempMorning.length
            ),
      morning_chance_of_rain:
        rainMorning.length === 0
          ? "Insufficient forecast data"
          : Number(
              (
                rainMorning.reduce((a, b) => a + b, 0) / rainMorning.length
              ).toFixed(2)
            ),
      // If no afternoon data, report insufficient data
      afternoon_average_temperature:
        tempAfternoon.length === 0
          ? "Insufficient forecast data"
          : Math.round(
              tempAfternoon.reduce((a, b) => a + b, 0) / tempAfternoon.length
            ),
      afternoon_chance_of_rain:
        rainAfternoon.length === 0
          ? "Insufficient forecast data"
          : Number(
              (
                rainAfternoon.reduce((a, b) => a + b, 0) / rainAfternoon.length
              ).toFixed(2)
            ),
      high_temperature: Math.max(...tempAll),
      low_temperature: Math.min(...tempAll),
    };

    // Format reader-friendly date
    const dayName = format(parseISO(day), "EEEE MMMM dd").replace(" 0", " ");

    summaries[dayName] = summary;
  });

  return summaries;
}

module.exports = summarizeForecast;
