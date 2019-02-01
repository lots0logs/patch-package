"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cross_spawn_1 = require("cross-spawn");
var defaultOptions = {
    logStdErrOnError: true,
    throwOnError: true,
};
exports.spawnSafeSync = function (command, args, options) {
    var mergedOptions = Object.assign({}, defaultOptions, options);
    var result = cross_spawn_1.sync(command, args, options);
    if (result.error || result.status !== 0) {
        if (mergedOptions.logStdErrOnError) {
            if (result.stderr) {
                console.error(result.stderr.toString());
            }
            else if (result.error) {
                console.error(result.error);
            }
        }
        if (mergedOptions.throwOnError) {
            throw result;
        }
    }
    return result;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Bhd25TYWZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NwYXduU2FmZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUErQztBQVMvQyxJQUFNLGNBQWMsR0FBcUI7SUFDdkMsZ0JBQWdCLEVBQUUsSUFBSTtJQUN0QixZQUFZLEVBQUUsSUFBSTtDQUNuQixDQUFBO0FBRVksUUFBQSxhQUFhLEdBQUcsVUFDM0IsT0FBZSxFQUNmLElBQWUsRUFDZixPQUEwQjtJQUUxQixJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDaEUsSUFBTSxNQUFNLEdBQUcsa0JBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ2hELElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN2QyxJQUFJLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRTtZQUNsQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO2FBQ3hDO2lCQUFNLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtnQkFDdkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDNUI7U0FDRjtRQUNELElBQUksYUFBYSxDQUFDLFlBQVksRUFBRTtZQUM5QixNQUFNLE1BQU0sQ0FBQTtTQUNiO0tBQ0Y7SUFDRCxPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHN5bmMgYXMgc3Bhd25TeW5jIH0gZnJvbSBcImNyb3NzLXNwYXduXCJcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU3Bhd25TYWZlT3B0aW9ucyB7XHJcbiAgdGhyb3dPbkVycm9yPzogYm9vbGVhblxyXG4gIGxvZ1N0ZEVyck9uRXJyb3I/OiBib29sZWFuXHJcbiAgY3dkPzogc3RyaW5nXHJcbiAgZW52Pzogb2JqZWN0XHJcbn1cclxuXHJcbmNvbnN0IGRlZmF1bHRPcHRpb25zOiBTcGF3blNhZmVPcHRpb25zID0ge1xyXG4gIGxvZ1N0ZEVyck9uRXJyb3I6IHRydWUsXHJcbiAgdGhyb3dPbkVycm9yOiB0cnVlLFxyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc3Bhd25TYWZlU3luYyA9IChcclxuICBjb21tYW5kOiBzdHJpbmcsXHJcbiAgYXJncz86IHN0cmluZ1tdLFxyXG4gIG9wdGlvbnM/OiBTcGF3blNhZmVPcHRpb25zLFxyXG4pID0+IHtcclxuICBjb25zdCBtZXJnZWRPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpXHJcbiAgY29uc3QgcmVzdWx0ID0gc3Bhd25TeW5jKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpXHJcbiAgaWYgKHJlc3VsdC5lcnJvciB8fCByZXN1bHQuc3RhdHVzICE9PSAwKSB7XHJcbiAgICBpZiAobWVyZ2VkT3B0aW9ucy5sb2dTdGRFcnJPbkVycm9yKSB7XHJcbiAgICAgIGlmIChyZXN1bHQuc3RkZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihyZXN1bHQuc3RkZXJyLnRvU3RyaW5nKCkpXHJcbiAgICAgIH0gZWxzZSBpZiAocmVzdWx0LmVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihyZXN1bHQuZXJyb3IpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChtZXJnZWRPcHRpb25zLnRocm93T25FcnJvcikge1xyXG4gICAgICB0aHJvdyByZXN1bHRcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHJlc3VsdFxyXG59XHJcbiJdfQ==