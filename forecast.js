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
  const total = sum(items.map((item) => item.average_temperature));
  return Math.round(total / items.length);
}

function chanceOfRain(items) {
  if (items.length === 0) return "Insufficient forecast data";
  const total = sum(items.map((item) => item.probability_of_rain));
  return Number((total / items.length).toFixed(2));
}

function formatDate(date) {
  return format(parseISO(date), "EEEE MMMM dd").replace(" 0", " ");
}

function getHighTemperature(items) {
  return Math.max(...items.map((item) => item.average_temperature));
}

function getLowTemperature(items) {
  return Math.min(...items.map((item) => item.average_temperature));
}

function createSumaries(groupedData) {
  const entries = Object.entries(groupedData).map(([day, items]) => {
    const summary = {
      morning_average_temperature: averageTemp(items.filter(isMorningItem)),
      morning_chance_of_rain: chanceOfRain(items.filter(isMorningItem)),
      afternoon_average_temperature: averageTemp(items.filter(isAfternoonItem)),
      afternoon_chance_of_rain: chanceOfRain(items.filter(isAfternoonItem)),
      high_temperature: getHighTemperature(items),
      low_temperature: getLowTemperature(items),
    };

    return [formatDate(day), summary];
  });

  return Object.fromEntries(entries);
}

function summarizeForecast(data) {
  const groupedByDay = groupByDay(data);

  const summaries = createSumaries(groupedByDay);

  return summaries;
}

module.exports = summarizeForecast;
