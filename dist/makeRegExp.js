"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
exports.makeRegExp = function (reString, name, defaultValue, caseSensitive) {
    if (!reString) {
        return defaultValue;
    }
    else {
        try {
            return new RegExp(reString, caseSensitive ? "" : "i");
        }
        catch (_) {
            console.error(chalk_1.red.bold("***ERROR***") + "\nInvalid format for option --" + name + "\n\n  Unable to convert the string " + JSON.stringify(reString) + " to a regular expression.\n");
            process.exit(1);
            return /unreachable/;
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZVJlZ0V4cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWtlUmVnRXhwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQTJCO0FBRWQsUUFBQSxVQUFVLEdBQUcsVUFDeEIsUUFBZ0IsRUFDaEIsSUFBWSxFQUNaLFlBQW9CLEVBQ3BCLGFBQXNCO0lBRXRCLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDYixPQUFPLFlBQVksQ0FBQTtLQUNwQjtTQUFNO1FBQ0wsSUFBSTtZQUNGLE9BQU8sSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUN0RDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBSSxXQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxzQ0FDaEIsSUFBSSwyQ0FFRCxJQUFJLENBQUMsU0FBUyxDQUMzQyxRQUFRLENBQ1QsZ0NBQ0YsQ0FBQyxDQUFBO1lBRUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNmLE9BQU8sYUFBYSxDQUFBO1NBQ3JCO0tBQ0Y7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZWQgfSBmcm9tIFwiY2hhbGtcIlxuXG5leHBvcnQgY29uc3QgbWFrZVJlZ0V4cCA9IChcbiAgcmVTdHJpbmc6IHN0cmluZyxcbiAgbmFtZTogc3RyaW5nLFxuICBkZWZhdWx0VmFsdWU6IFJlZ0V4cCxcbiAgY2FzZVNlbnNpdGl2ZTogYm9vbGVhbixcbik6IFJlZ0V4cCA9PiB7XG4gIGlmICghcmVTdHJpbmcpIHtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKHJlU3RyaW5nLCBjYXNlU2Vuc2l0aXZlID8gXCJcIiA6IFwiaVwiKVxuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYCR7cmVkLmJvbGQoXCIqKipFUlJPUioqKlwiKX1cbkludmFsaWQgZm9ybWF0IGZvciBvcHRpb24gLS0ke25hbWV9XG5cbiAgVW5hYmxlIHRvIGNvbnZlcnQgdGhlIHN0cmluZyAke0pTT04uc3RyaW5naWZ5KFxuICAgIHJlU3RyaW5nLFxuICApfSB0byBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbmApXG5cbiAgICAgIHByb2Nlc3MuZXhpdCgxKVxuICAgICAgcmV0dXJuIC91bnJlYWNoYWJsZS9cbiAgICB9XG4gIH1cbn1cbiJdfQ==