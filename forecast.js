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

function isMorningItem(item) {
  const itemTime = parseISO(item.date_time);
  const hour = itemTime.getHours();
  return 6 <= hour && hour < 12;
}

function morningAverageTemp(items) {
  const morningItems = items.filter(isMorningItem);

  return morningItems.length === 0
    ? "Insufficient forecast data"
    : Math.round(
        morningItems.reduce((acc, item) => acc + item.average_temperature, 0) /
          morningItems.length
      );
}

function morningChanceOfRain(items) {
  const morningItems = items.filter(isMorningItem);

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

function afternoonAverageTemp(items) {
  const afternoonItems = items.filter((item) => {
    const itemTime = parseISO(item.date_time);
    const hour = itemTime.getHours();
    return 12 <= hour && hour < 18;
  });

  return afternoonItems.length === 0
    ? "Insufficient forecast data"
    : Math.round(
        afternoonItems.reduce(
          (acc, item) => acc + item.average_temperature,
          0
        ) / afternoonItems.length
      );
}

function afternoonChanceOfRain(items) {
  const afternoonItems = items.filter((item) => {
    const itemTime = parseISO(item.date_time);
    const hour = itemTime.getHours();
    return 12 <= hour && hour < 18;
  });

  return afternoonItems.length === 0
    ? "Insufficient forecast data"
    : Number(
        (
          afternoonItems.reduce(
            (acc, item) => acc + item.probability_of_rain,
            0
          ) / afternoonItems.length
        ).toFixed(2)
      );
}

function createSumaries(groupedData) {
  const summaries = {};

  // Process each day
  Object.keys(groupedData).forEach((day) => {
    const items = groupedData[day];
    const tempAll = items.map((entry) => entry.average_temperature);

    const summary = {
      morning_average_temperature: morningAverageTemp(items),
      morning_chance_of_rain: morningChanceOfRain(items),
      afternoon_average_temperature: afternoonAverageTemp(items),
      afternoon_chance_of_rain: afternoonChanceOfRain(items),
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
