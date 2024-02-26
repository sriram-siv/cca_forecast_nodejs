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

function isAfternoonItem(item) {
  const itemTime = parseISO(item.date_time);
  const hour = itemTime.getHours();
  return 12 <= hour && hour < 18;
}

function sum(nums) {
  return nums.reduce((acc, num) => acc + num);
}

function averageTemp(items) {
  if (items.length === 0) return "Insufficient forecast data";
  const total = sum(items.map((entry) => entry.average_temperature));
  return Math.round(total / items.length);
}

function chanceOfRain(items) {
  return items.length === 0
    ? "Insufficient forecast data"
    : Number(
        (
          items.reduce((acc, item) => acc + item.probability_of_rain, 0) /
          items.length
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
      morning_average_temperature: averageTemp(items.filter(isMorningItem)),
      morning_chance_of_rain: chanceOfRain(items.filter(isMorningItem)),
      afternoon_average_temperature: averageTemp(items.filter(isAfternoonItem)),
      afternoon_chance_of_rain: chanceOfRain(items.filter(isAfternoonItem)),
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
