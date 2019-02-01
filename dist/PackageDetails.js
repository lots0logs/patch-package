"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
function parseNameAndVersion(s) {
    var parts = s.split("+");
    switch (parts.length) {
        case 1: {
            return { name: parts[0] };
        }
        case 2: {
            var nameOrScope = parts[0], versionOrName = parts[1];
            if (versionOrName.match(/^\d+/)) {
                return {
                    name: nameOrScope,
                    version: versionOrName,
                };
            }
            return { name: nameOrScope + "/" + versionOrName };
        }
        case 3: {
            var scope = parts[0], name = parts[1], version = parts[2];
            return { name: scope + "/" + name, version: version };
        }
    }
    return null;
}
function getPackageDetailsFromPatchFilename(patchFilename) {
    var legacyMatch = patchFilename.match(/^([^+=]+?)(:|\+)(\d+\.\d+\.\d+.*)\.patch$/);
    if (legacyMatch) {
        var name = legacyMatch[1];
        var version = legacyMatch[3];
        return {
            packageNames: [name],
            pathSpecifier: name,
            humanReadablePathSpecifier: name,
            path: path_1.join("node_modules", name),
            name: name,
            version: version,
            isNested: false,
            patchFilename: patchFilename,
        };
    }
    var parts = patchFilename
        .replace(/\.patch$/, "")
        .split("++")
        .map(parseNameAndVersion)
        .filter(function (x) { return x !== null; });
    if (parts.length === 0) {
        return null;
    }
    var lastPart = parts[parts.length - 1];
    if (!lastPart.version) {
        return null;
    }
    return {
        name: lastPart.name,
        version: lastPart.version,
        path: path_1.join("node_modules", parts.map(function (_a) {
            var name = _a.name;
            return name;
        }).join("/node_modules/")),
        patchFilename: patchFilename,
        pathSpecifier: parts.map(function (_a) {
            var name = _a.name;
            return name;
        }).join("/"),
        humanReadablePathSpecifier: parts.map(function (_a) {
            var name = _a.name;
            return name;
        }).join(" => "),
        isNested: parts.length > 1,
        packageNames: parts.map(function (_a) {
            var name = _a.name;
            return name;
        }),
    };
}
exports.getPackageDetailsFromPatchFilename = getPackageDetailsFromPatchFilename;
function getPatchDetailsFromCliString(specifier) {
    var parts = specifier.split("/");
    var packageNames = [];
    var scope = null;
    for (var i = 0; i < parts.length; i++) {
        if (parts[i].startsWith("@")) {
            if (scope) {
                return null;
            }
            scope = parts[i];
        }
        else {
            if (scope) {
                packageNames.push(scope + "/" + parts[i]);
                scope = null;
            }
            else {
                packageNames.push(parts[i]);
            }
        }
    }
    var path = path_1.join("node_modules", packageNames.join("/node_modules/"));
    return {
        packageNames: packageNames,
        path: path,
        name: packageNames[packageNames.length - 1],
        humanReadablePathSpecifier: packageNames.join(" => "),
        isNested: packageNames.length > 1,
        pathSpecifier: specifier,
    };
}
exports.getPatchDetailsFromCliString = getPatchDetailsFromCliString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFja2FnZURldGFpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvUGFja2FnZURldGFpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBMkI7QUFnQjNCLFNBQVMsbUJBQW1CLENBQzFCLENBQVM7SUFLVCxJQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLFFBQVEsS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUNwQixLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ04sT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtTQUMxQjtRQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDQyxJQUFBLHNCQUFXLEVBQUUsd0JBQWEsQ0FBUztZQUMxQyxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQy9CLE9BQU87b0JBQ0wsSUFBSSxFQUFFLFdBQVc7b0JBQ2pCLE9BQU8sRUFBRSxhQUFhO2lCQUN2QixDQUFBO2FBQ0Y7WUFDRCxPQUFPLEVBQUUsSUFBSSxFQUFLLFdBQVcsU0FBSSxhQUFlLEVBQUUsQ0FBQTtTQUNuRDtRQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDQyxJQUFBLGdCQUFLLEVBQUUsZUFBSSxFQUFFLGtCQUFPLENBQVM7WUFDcEMsT0FBTyxFQUFFLElBQUksRUFBSyxLQUFLLFNBQUksSUFBTSxFQUFFLE9BQU8sU0FBQSxFQUFFLENBQUE7U0FDN0M7S0FDRjtJQUNELE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQztBQUVELFNBQWdCLGtDQUFrQyxDQUNoRCxhQUFxQjtJQUVyQixJQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUNyQywyQ0FBMkMsQ0FDNUMsQ0FBQTtJQUVELElBQUksV0FBVyxFQUFFO1FBQ2YsSUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzNC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Q0FBQyxDQUFDLENBQUE7YUFDNUI7U0FDRjtLQUNGO0lBRUQsSUFBTSxJQUFJLEdBQUcsV0FBSSxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQTtJQUV0RSxPQUFPO1FBQ0wsWUFBWSxjQUFBO1FBQ1osSUFBSSxNQUFBO1FBQ0osSUFBSSxFQUFFLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUMzQywwQkFBMEIsRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNyRCxRQUFRLEVBQUUsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQ2pDLGFBQWEsRUFBRSxTQUFTO0tBQ3pCLENBQUE7QUFDSCxDQUFDO0FBbkNELG9FQW1DQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4gfSBmcm9tIFwicGF0aFwiXG5cbmludGVyZmFjZSBQYWNrYWdlRGV0YWlscyB7XG4gIGh1bWFuUmVhZGFibGVQYXRoU3BlY2lmaWVyOiBzdHJpbmdcbiAgcGF0aFNwZWNpZmllcjogc3RyaW5nXG4gIHBhdGg6IHN0cmluZ1xuICBuYW1lOiBzdHJpbmdcbiAgaXNOZXN0ZWQ6IGJvb2xlYW5cbiAgcGFja2FnZU5hbWVzOiBzdHJpbmdbXVxufVxuXG5pbnRlcmZhY2UgUGF0Y2hlZFBhY2thZ2VEZXRhaWxzIGV4dGVuZHMgUGFja2FnZURldGFpbHMge1xuICB2ZXJzaW9uOiBzdHJpbmdcbiAgcGF0Y2hGaWxlbmFtZTogc3RyaW5nXG59XG5cbmZ1bmN0aW9uIHBhcnNlTmFtZUFuZFZlcnNpb24oXG4gIHM6IHN0cmluZyxcbik6IHtcbiAgbmFtZTogc3RyaW5nXG4gIHZlcnNpb24/OiBzdHJpbmdcbn0gfCBudWxsIHtcbiAgY29uc3QgcGFydHMgPSBzLnNwbGl0KFwiK1wiKVxuICBzd2l0Y2ggKHBhcnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMToge1xuICAgICAgcmV0dXJuIHsgbmFtZTogcGFydHNbMF0gfVxuICAgIH1cbiAgICBjYXNlIDI6IHtcbiAgICAgIGNvbnN0IFtuYW1lT3JTY29wZSwgdmVyc2lvbk9yTmFtZV0gPSBwYXJ0c1xuICAgICAgaWYgKHZlcnNpb25Pck5hbWUubWF0Y2goL15cXGQrLykpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBuYW1lOiBuYW1lT3JTY29wZSxcbiAgICAgICAgICB2ZXJzaW9uOiB2ZXJzaW9uT3JOYW1lLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geyBuYW1lOiBgJHtuYW1lT3JTY29wZX0vJHt2ZXJzaW9uT3JOYW1lfWAgfVxuICAgIH1cbiAgICBjYXNlIDM6IHtcbiAgICAgIGNvbnN0IFtzY29wZSwgbmFtZSwgdmVyc2lvbl0gPSBwYXJ0c1xuICAgICAgcmV0dXJuIHsgbmFtZTogYCR7c2NvcGV9LyR7bmFtZX1gLCB2ZXJzaW9uIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhY2thZ2VEZXRhaWxzRnJvbVBhdGNoRmlsZW5hbWUoXG4gIHBhdGNoRmlsZW5hbWU6IHN0cmluZyxcbik6IFBhdGNoZWRQYWNrYWdlRGV0YWlscyB8IG51bGwge1xuICBjb25zdCBsZWdhY3lNYXRjaCA9IHBhdGNoRmlsZW5hbWUubWF0Y2goXG4gICAgL14oW14rPV0rPykoOnxcXCspKFxcZCtcXC5cXGQrXFwuXFxkKy4qKVxcLnBhdGNoJC8sXG4gIClcblxuICBpZiAobGVnYWN5TWF0Y2gpIHtcbiAgICBjb25zdCBuYW1lID0gbGVnYWN5TWF0Y2hbMV1cbiAgICBjb25zdCB2ZXJzaW9uID0gbGVnYWN5TWF0Y2hbM11cblxuICAgIHJldHVybiB7XG4gICAgICBwYWNrYWdlTmFtZXM6IFtuYW1lXSxcbiAgICAgIHBhdGhTcGVjaWZpZXI6IG5hbWUsXG4gICAgICBodW1hblJlYWRhYmxlUGF0aFNwZWNpZmllcjogbmFtZSxcbiAgICAgIHBhdGg6IGpvaW4oXCJub2RlX21vZHVsZXNcIiwgbmFtZSksXG4gICAgICBuYW1lLFxuICAgICAgdmVyc2lvbixcbiAgICAgIGlzTmVzdGVkOiBmYWxzZSxcbiAgICAgIHBhdGNoRmlsZW5hbWUsXG4gICAgfVxuICB9XG5cbiAgY29uc3QgcGFydHMgPSBwYXRjaEZpbGVuYW1lXG4gICAgLnJlcGxhY2UoL1xcLnBhdGNoJC8sIFwiXCIpXG4gICAgLnNwbGl0KFwiKytcIilcbiAgICAubWFwKHBhcnNlTmFtZUFuZFZlcnNpb24pXG4gICAgLmZpbHRlcigoeCk6IHggaXMgTm9uTnVsbGFibGU8dHlwZW9mIHg+ID0+IHggIT09IG51bGwpXG5cbiAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBsYXN0UGFydCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdXG5cbiAgaWYgKCFsYXN0UGFydC52ZXJzaW9uKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbmFtZTogbGFzdFBhcnQubmFtZSxcbiAgICB2ZXJzaW9uOiBsYXN0UGFydC52ZXJzaW9uLFxuICAgIHBhdGg6IGpvaW4oXG4gICAgICBcIm5vZGVfbW9kdWxlc1wiLFxuICAgICAgcGFydHMubWFwKCh7IG5hbWUgfSkgPT4gbmFtZSkuam9pbihcIi9ub2RlX21vZHVsZXMvXCIpLFxuICAgICksXG4gICAgcGF0Y2hGaWxlbmFtZSxcbiAgICBwYXRoU3BlY2lmaWVyOiBwYXJ0cy5tYXAoKHsgbmFtZSB9KSA9PiBuYW1lKS5qb2luKFwiL1wiKSxcbiAgICBodW1hblJlYWRhYmxlUGF0aFNwZWNpZmllcjogcGFydHMubWFwKCh7IG5hbWUgfSkgPT4gbmFtZSkuam9pbihcIiA9PiBcIiksXG4gICAgaXNOZXN0ZWQ6IHBhcnRzLmxlbmd0aCA+IDEsXG4gICAgcGFja2FnZU5hbWVzOiBwYXJ0cy5tYXAoKHsgbmFtZSB9KSA9PiBuYW1lKSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGF0Y2hEZXRhaWxzRnJvbUNsaVN0cmluZyhcbiAgc3BlY2lmaWVyOiBzdHJpbmcsXG4pOiBQYWNrYWdlRGV0YWlscyB8IG51bGwge1xuICBjb25zdCBwYXJ0cyA9IHNwZWNpZmllci5zcGxpdChcIi9cIilcblxuICBjb25zdCBwYWNrYWdlTmFtZXMgPSBbXVxuXG4gIGxldCBzY29wZTogc3RyaW5nIHwgbnVsbCA9IG51bGxcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHBhcnRzW2ldLnN0YXJ0c1dpdGgoXCJAXCIpKSB7XG4gICAgICBpZiAoc2NvcGUpIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cbiAgICAgIHNjb3BlID0gcGFydHNbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNjb3BlKSB7XG4gICAgICAgIHBhY2thZ2VOYW1lcy5wdXNoKGAke3Njb3BlfS8ke3BhcnRzW2ldfWApXG4gICAgICAgIHNjb3BlID0gbnVsbFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFja2FnZU5hbWVzLnB1c2gocGFydHNbaV0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcGF0aCA9IGpvaW4oXCJub2RlX21vZHVsZXNcIiwgcGFja2FnZU5hbWVzLmpvaW4oXCIvbm9kZV9tb2R1bGVzL1wiKSlcblxuICByZXR1cm4ge1xuICAgIHBhY2thZ2VOYW1lcyxcbiAgICBwYXRoLFxuICAgIG5hbWU6IHBhY2thZ2VOYW1lc1twYWNrYWdlTmFtZXMubGVuZ3RoIC0gMV0sXG4gICAgaHVtYW5SZWFkYWJsZVBhdGhTcGVjaWZpZXI6IHBhY2thZ2VOYW1lcy5qb2luKFwiID0+IFwiKSxcbiAgICBpc05lc3RlZDogcGFja2FnZU5hbWVzLmxlbmd0aCA+IDEsXG4gICAgcGF0aFNwZWNpZmllcjogc3BlY2lmaWVyLFxuICB9XG59XG4iXX0=