const assert = require('assert');
const summarizeForecast = require('../forecast.js');
const weatherData = require('./data');

describe('ForecastTest', function() {
    const summary = summarizeForecast(weatherData);

    it("should correctly calculate morning average temperature", function () {
      assert.strictEqual(
        summary["Sunday February 18"]["morning_average_temperature"],
        10
      );
    });

    it('should correctly calculate morning chance of rain', function() {
        assert.strictEqual(summary["Sunday February 18"]["morning_chance_of_rain"], 0.14);
    });

    it('should correctly calculate afternoon average temperature', function() {
        assert.strictEqual(summary["Sunday February 18"]["afternoon_average_temperature"], 16);
    });

    it('should report the high temperature correctly', function() {
        assert.strictEqual(summary["Sunday February 18"]["high_temperature"], 17);
    });

    it('should correctly calculate afternoon chance of rain', function() {
        assert.strictEqual(summary["Sunday February 18"]["afternoon_chance_of_rain"], 0.4);
    });

    it('should report the low temperature correctly', function() {
        assert.strictEqual(summary["Sunday February 18"]["low_temperature"], 6);
    });

    it('should report "Insufficient forecast data" for morning data when insufficient', function() {
        const testSummary = summarizeForecast([
            {"date_time": "2024-02-18T00:00:00Z", "average_temperature": 12, "probability_of_rain": 0.35}
        ]);
        assert.strictEqual(testSummary["Sunday February 18"]["morning_average_temperature"], "Insufficient forecast data");
    });

    it('should report "Insufficient forecast data" for afternoon data when insufficient', function() {
        const testSummary = summarizeForecast([
            {"date_time": "2024-02-18T00:00:00Z", "average_temperature": 12, "probability_of_rain": 0.35}
        ]);
        assert.strictEqual(testSummary["Sunday February 18"]["afternoon_average_temperature"], "Insufficient forecast data");
    });

    it('should handle multiple days correctly', function() {
        const testSummary = summarizeForecast([
            {"date_time": "2024-02-18T00:00:00Z", "average_temperature": 12, "probability_of_rain": 0.35},
            {"date_time": "2024-02-19T00:00:00Z", "average_temperature": 12, "probability_of_rain": 0.35}
        ]);
        assert.strictEqual(Object.keys(testSummary).length, 2);
    });

    it('should handle no entries correctly', function() {
        const testSummary = summarizeForecast([]);
        assert.strictEqual(Object.keys(testSummary).length, 0);
    });
});
