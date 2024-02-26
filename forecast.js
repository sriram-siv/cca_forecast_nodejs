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

function morningAverageTemp(items) {
  const morningItems = items.filter((item) => {
    const itemTime = parseISO(item.date_time);
    const hour = itemTime.getHours();
    return 6 <= hour && hour < 12;
  });

  return morningItems.length === 0
    ? "Insufficient forecast data"
    : Math.round(
        morningItems.reduce((acc, item) => acc + item.average_temperature, 0) /
          morningItems.length
      );
}


function morningChanceOfRain(items) {
  const morningItems = items.filter((item) => {
    const itemTime = parseISO(item.date_time);
    const hour = itemTime.getHours();
    return 6 <= hour && hour < 12;
  });

  return morningItems.length === 0
    ? "Insufficient forecast data"
    : Number(
        (
          morningItems.reduce(
            (acc, item) => acc + item.probability_of_rain,
            0
          ) / morningItems.length
        ).toFixed(2)
      );
}

function createSumaries(groupedData) {
  const summaries = {};

  // Process each day
  Object.keys(groupedData).forEach((day) => {
    const items = groupedData[day];
    const tempAfternoon = [];
    const rainAfternoon = [];
    const tempAll = items.map((entry) => entry.average_temperature);

    items.forEach((entry) => {
      const entryTime = parseISO(entry.date_time);
      const hour = entryTime.getHours();

      // Collect afternoon period entries
      if (12 <= hour && hour < 18) {
        tempAfternoon.push(entry.average_temperature);
        rainAfternoon.push(entry.probability_of_rain);
      }
    });

    const summary = {
      // If no morning data, report insufficient data
      morning_average_temperature: morningAverageTemp(items),
      morning_chance_of_rain: morningChanceOfRain(items),

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

function summarizeForecast(data) {
  const groupedByDay = groupByDay(data);

  const summaries = createSumaries(groupedByDay);

  return summaries;
}

module.exports = summarizeForecast;
