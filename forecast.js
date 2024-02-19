const { parseISO, format } = require('date-fns');

function summarizeForecast(data) {
    const grpDay = {};

    // Group entries by day
    data.forEach(e => {
        const entryTime = parseISO(e.date_time);
        const key = entryTime.toISOString().split('T')[0]; // Get date part only
        if (!grpDay[key]) {
            grpDay[key] = [];
        }
        grpDay[key].push(e);
    });

    const summaries = {};

    // Process each day
    Object.keys(grpDay).forEach(day => {
        const entries = grpDay[day];
        const tMorning = [];
        const rMorning = [];
        const tAfternoon = [];
        const rAfternoon = [];
        const tAll = entries.map(entry => entry.average_temperature);

        entries.forEach(entry => {
            const entryTime = parseISO(entry.date_time);
            const hour = entryTime.getHours();
            // Collect morning period entries
            if (6 <= hour && hour < 12) {
                tMorning.push(entry.average_temperature);
                rMorning.push(entry.probability_of_rain);
            }
            // Collect afternoon period entries
            else if (12 <= hour && hour < 18) {
                tAfternoon.push(entry.average_temperature);
                rAfternoon.push(entry.probability_of_rain);
            }
        });

        const summary = {
            // If no morning data, report insufficient data
            morning_average_temperature: tMorning.length === 0 ? "Insufficient forecast data" :
                Math.round(tMorning.reduce((a, b) => a + b, 0) / tMorning.length),
            morning_chance_of_rain: rMorning.length === 0 ? "Insufficient forecast data" :
                Number((rMorning.reduce((a, b) => a + b, 0) / rMorning.length).toFixed(2)),
            // If no afternoon data, report insufficient data
            afternoon_average_temperature: tAfternoon.length === 0 ? "Insufficient forecast data" :
                Math.round(tAfternoon.reduce((a, b) => a + b, 0) / tAfternoon.length),
            afternoon_chance_of_rain: rAfternoon.length === 0 ? "Insufficient forecast data" :
                Number((rAfternoon.reduce((a, b) => a + b, 0) / rAfternoon.length).toFixed(2)),
            high_temperature: Math.max(...tAll),
            low_temperature: Math.min(...tAll)
        };

        // Format reader-friendly date
        const dayName = format(parseISO(day), 'EEEE MMMM dd').replace(' 0', ' ');

        summaries[dayName] = summary;
    });

    return summaries;
}

module.exports = summarizeForecast;
