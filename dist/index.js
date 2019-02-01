"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var process_1 = __importDefault(require("process"));
var minimist_1 = __importDefault(require("minimist"));
var applyPatches_1 = require("./applyPatches");
var getAppRootPath_1 = require("./getAppRootPath");
var makePatch_1 = require("./makePatch");
var makeRegExp_1 = require("./makeRegExp");
var detectPackageManager_1 = require("./detectPackageManager");
var path_1 = require("./path");
var appPath = getAppRootPath_1.getAppRootPath();
var argv = minimist_1.default(process_1.default.argv.slice(2), {
    boolean: [
        "use-yarn",
        "case-sensitive-path-filtering",
        "reverse",
        "help",
        "version",
    ],
    string: ["patch-dir"],
});
var packageNames = argv._;
console.log(chalk_1.bold("patch-package"), 
// tslint:disable-next-line:no-var-requires
require(path_1.join(__dirname, "../package.json")).version);
if (argv.version || argv.v) {
    // noop
}
else if (argv.help || argv.h) {
    printHelp();
}
else {
    if (packageNames.length) {
        var include_1 = makeRegExp_1.makeRegExp(argv.include, "include", /.*/, argv["case-sensitive-path-filtering"]);
        var exclude_1 = makeRegExp_1.makeRegExp(argv.exclude, "exclude", /package\.json$/, argv["case-sensitive-path-filtering"]);
        packageNames.forEach(function (packageName) {
            makePatch_1.makePatch(packageName, appPath, detectPackageManager_1.detectPackageManager(appPath, argv["use-yarn"] ? "yarn" : null), include_1, exclude_1, argv["patch-dir"]);
        });
    }
    else {
        console.log("Applying patches...");
        applyPatches_1.applyPatchesForApp(appPath, !!argv["reverse"], argv["patch-dir"]);
    }
}
function printHelp() {
    console.log("\nUsage:\n\n  1. Patching packages\n  ====================\n\n    " + chalk_1.bold("patch-package") + "\n\n  Without arguments, the " + chalk_1.bold("patch-package") + " command will attempt to find and apply\n  patch files to your project. It looks for files named like\n\n     ./patches/<package-name>+<version>.patch\n\n  2. Creating patch files\n  =======================\n\n    " + chalk_1.bold("patch-package") + " <package-name>" + chalk_1.italic("[ <package-name>]") + "\n\n  When given package names as arguments, patch-package will create patch files\n  based on any changes you've made to the versions installed by yarn/npm.\n\n  Options:\n\n     " + chalk_1.bold("--use-yarn") + "\n\n         By default, patch-package checks whether you use npm or yarn based on\n         which lockfile you have. If you have both, it uses npm by default.\n         Set this option to override that default and always use yarn.\n\n     " + chalk_1.bold("--exclude <regexp>") + "\n\n         Ignore paths matching the regexp when creating patch files.\n         Paths are relative to the root dir of the package to be patched.\n\n         Default: 'package\\.json$'\n\n     " + chalk_1.bold("--include <regexp>") + "\n\n         Only consider paths matching the regexp when creating patch files.\n         Paths are relative to the root dir of the package to be patched.\n\n         Default '.*'\n\n     " + chalk_1.bold("--case-sensitive-path-filtering") + "\n\n         Make regexps used in --include or --exclude filters case-sensitive.\n");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQkFBb0M7QUFDcEMsb0RBQTZCO0FBQzdCLHNEQUErQjtBQUUvQiwrQ0FBbUQ7QUFDbkQsbURBQWlEO0FBQ2pELHlDQUF1QztBQUN2QywyQ0FBeUM7QUFDekMsK0RBQTZEO0FBQzdELCtCQUE2QjtBQUU3QixJQUFNLE9BQU8sR0FBRywrQkFBYyxFQUFFLENBQUE7QUFDaEMsSUFBTSxJQUFJLEdBQUcsa0JBQVEsQ0FBQyxpQkFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDM0MsT0FBTyxFQUFFO1FBQ1AsVUFBVTtRQUNWLCtCQUErQjtRQUMvQixTQUFTO1FBQ1QsTUFBTTtRQUNOLFNBQVM7S0FDVjtJQUNELE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQztDQUN0QixDQUFDLENBQUE7QUFDRixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBRTNCLE9BQU8sQ0FBQyxHQUFHLENBQ1QsWUFBSSxDQUFDLGVBQWUsQ0FBQztBQUNyQiwyQ0FBMkM7QUFDM0MsT0FBTyxDQUFDLFdBQUksQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FDcEQsQ0FBQTtBQUVELElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0lBQzFCLE9BQU87Q0FDUjtLQUFNLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0lBQzlCLFNBQVMsRUFBRSxDQUFBO0NBQ1o7S0FBTTtJQUNMLElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtRQUN2QixJQUFNLFNBQU8sR0FBRyx1QkFBVSxDQUN4QixJQUFJLENBQUMsT0FBTyxFQUNaLFNBQVMsRUFDVCxJQUFJLEVBQ0osSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQ3RDLENBQUE7UUFDRCxJQUFNLFNBQU8sR0FBRyx1QkFBVSxDQUN4QixJQUFJLENBQUMsT0FBTyxFQUNaLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQ3RDLENBQUE7UUFDRCxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQUMsV0FBbUI7WUFDdkMscUJBQVMsQ0FDUCxXQUFXLEVBQ1gsT0FBTyxFQUNQLDJDQUFvQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQy9ELFNBQU8sRUFDUCxTQUFPLEVBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUNsQixDQUFBO1FBQ0gsQ0FBQyxDQUFDLENBQUE7S0FDSDtTQUFNO1FBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1FBQ2xDLGlDQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO0tBQ2xFO0NBQ0Y7QUFFRCxTQUFTLFNBQVM7SUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1RUFNUixZQUFJLENBQUMsZUFBZSxDQUFDLHFDQUVBLFlBQUksQ0FDM0IsZUFBZSxDQUNoQiw4TkFRRyxZQUFJLENBQUMsZUFBZSxDQUFDLHVCQUFrQixjQUFNLENBQUMsbUJBQW1CLENBQUMsNExBT2pFLFlBQUksQ0FBQyxZQUFZLENBQUMsd1BBTWxCLFlBQUksQ0FBQyxvQkFBb0IsQ0FBQywyTUFPMUIsWUFBSSxDQUFDLG9CQUFvQixDQUFDLG9NQU8xQixZQUFJLENBQUMsaUNBQWlDLENBQUMsdUZBRzdDLENBQUMsQ0FBQTtBQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBib2xkLCBpdGFsaWMgfSBmcm9tIFwiY2hhbGtcIlxuaW1wb3J0IHByb2Nlc3MgZnJvbSBcInByb2Nlc3NcIlxuaW1wb3J0IG1pbmltaXN0IGZyb20gXCJtaW5pbWlzdFwiXG5cbmltcG9ydCB7IGFwcGx5UGF0Y2hlc0ZvckFwcCB9IGZyb20gXCIuL2FwcGx5UGF0Y2hlc1wiXG5pbXBvcnQgeyBnZXRBcHBSb290UGF0aCB9IGZyb20gXCIuL2dldEFwcFJvb3RQYXRoXCJcbmltcG9ydCB7IG1ha2VQYXRjaCB9IGZyb20gXCIuL21ha2VQYXRjaFwiXG5pbXBvcnQgeyBtYWtlUmVnRXhwIH0gZnJvbSBcIi4vbWFrZVJlZ0V4cFwiXG5pbXBvcnQgeyBkZXRlY3RQYWNrYWdlTWFuYWdlciB9IGZyb20gXCIuL2RldGVjdFBhY2thZ2VNYW5hZ2VyXCJcbmltcG9ydCB7IGpvaW4gfSBmcm9tIFwiLi9wYXRoXCJcblxuY29uc3QgYXBwUGF0aCA9IGdldEFwcFJvb3RQYXRoKClcbmNvbnN0IGFyZ3YgPSBtaW5pbWlzdChwcm9jZXNzLmFyZ3Yuc2xpY2UoMiksIHtcbiAgYm9vbGVhbjogW1xuICAgIFwidXNlLXlhcm5cIixcbiAgICBcImNhc2Utc2Vuc2l0aXZlLXBhdGgtZmlsdGVyaW5nXCIsXG4gICAgXCJyZXZlcnNlXCIsXG4gICAgXCJoZWxwXCIsXG4gICAgXCJ2ZXJzaW9uXCIsXG4gIF0sXG4gIHN0cmluZzogW1wicGF0Y2gtZGlyXCJdLFxufSlcbmNvbnN0IHBhY2thZ2VOYW1lcyA9IGFyZ3YuX1xuXG5jb25zb2xlLmxvZyhcbiAgYm9sZChcInBhdGNoLXBhY2thZ2VcIiksXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby12YXItcmVxdWlyZXNcbiAgcmVxdWlyZShqb2luKF9fZGlybmFtZSwgXCIuLi9wYWNrYWdlLmpzb25cIikpLnZlcnNpb24sXG4pXG5cbmlmIChhcmd2LnZlcnNpb24gfHwgYXJndi52KSB7XG4gIC8vIG5vb3Bcbn0gZWxzZSBpZiAoYXJndi5oZWxwIHx8IGFyZ3YuaCkge1xuICBwcmludEhlbHAoKVxufSBlbHNlIHtcbiAgaWYgKHBhY2thZ2VOYW1lcy5sZW5ndGgpIHtcbiAgICBjb25zdCBpbmNsdWRlID0gbWFrZVJlZ0V4cChcbiAgICAgIGFyZ3YuaW5jbHVkZSxcbiAgICAgIFwiaW5jbHVkZVwiLFxuICAgICAgLy4qLyxcbiAgICAgIGFyZ3ZbXCJjYXNlLXNlbnNpdGl2ZS1wYXRoLWZpbHRlcmluZ1wiXSxcbiAgICApXG4gICAgY29uc3QgZXhjbHVkZSA9IG1ha2VSZWdFeHAoXG4gICAgICBhcmd2LmV4Y2x1ZGUsXG4gICAgICBcImV4Y2x1ZGVcIixcbiAgICAgIC9wYWNrYWdlXFwuanNvbiQvLFxuICAgICAgYXJndltcImNhc2Utc2Vuc2l0aXZlLXBhdGgtZmlsdGVyaW5nXCJdLFxuICAgIClcbiAgICBwYWNrYWdlTmFtZXMuZm9yRWFjaCgocGFja2FnZU5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgbWFrZVBhdGNoKFxuICAgICAgICBwYWNrYWdlTmFtZSxcbiAgICAgICAgYXBwUGF0aCxcbiAgICAgICAgZGV0ZWN0UGFja2FnZU1hbmFnZXIoYXBwUGF0aCwgYXJndltcInVzZS15YXJuXCJdID8gXCJ5YXJuXCIgOiBudWxsKSxcbiAgICAgICAgaW5jbHVkZSxcbiAgICAgICAgZXhjbHVkZSxcbiAgICAgICAgYXJndltcInBhdGNoLWRpclwiXSxcbiAgICAgIClcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiQXBwbHlpbmcgcGF0Y2hlcy4uLlwiKVxuICAgIGFwcGx5UGF0Y2hlc0ZvckFwcChhcHBQYXRoLCAhIWFyZ3ZbXCJyZXZlcnNlXCJdLCBhcmd2W1wicGF0Y2gtZGlyXCJdKVxuICB9XG59XG5cbmZ1bmN0aW9uIHByaW50SGVscCgpIHtcbiAgY29uc29sZS5sb2coYFxuVXNhZ2U6XG5cbiAgMS4gUGF0Y2hpbmcgcGFja2FnZXNcbiAgPT09PT09PT09PT09PT09PT09PT1cblxuICAgICR7Ym9sZChcInBhdGNoLXBhY2thZ2VcIil9XG5cbiAgV2l0aG91dCBhcmd1bWVudHMsIHRoZSAke2JvbGQoXG4gICAgXCJwYXRjaC1wYWNrYWdlXCIsXG4gICl9IGNvbW1hbmQgd2lsbCBhdHRlbXB0IHRvIGZpbmQgYW5kIGFwcGx5XG4gIHBhdGNoIGZpbGVzIHRvIHlvdXIgcHJvamVjdC4gSXQgbG9va3MgZm9yIGZpbGVzIG5hbWVkIGxpa2VcblxuICAgICAuL3BhdGNoZXMvPHBhY2thZ2UtbmFtZT4rPHZlcnNpb24+LnBhdGNoXG5cbiAgMi4gQ3JlYXRpbmcgcGF0Y2ggZmlsZXNcbiAgPT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgICR7Ym9sZChcInBhdGNoLXBhY2thZ2VcIil9IDxwYWNrYWdlLW5hbWU+JHtpdGFsaWMoXCJbIDxwYWNrYWdlLW5hbWU+XVwiKX1cblxuICBXaGVuIGdpdmVuIHBhY2thZ2UgbmFtZXMgYXMgYXJndW1lbnRzLCBwYXRjaC1wYWNrYWdlIHdpbGwgY3JlYXRlIHBhdGNoIGZpbGVzXG4gIGJhc2VkIG9uIGFueSBjaGFuZ2VzIHlvdSd2ZSBtYWRlIHRvIHRoZSB2ZXJzaW9ucyBpbnN0YWxsZWQgYnkgeWFybi9ucG0uXG5cbiAgT3B0aW9uczpcblxuICAgICAke2JvbGQoXCItLXVzZS15YXJuXCIpfVxuXG4gICAgICAgICBCeSBkZWZhdWx0LCBwYXRjaC1wYWNrYWdlIGNoZWNrcyB3aGV0aGVyIHlvdSB1c2UgbnBtIG9yIHlhcm4gYmFzZWQgb25cbiAgICAgICAgIHdoaWNoIGxvY2tmaWxlIHlvdSBoYXZlLiBJZiB5b3UgaGF2ZSBib3RoLCBpdCB1c2VzIG5wbSBieSBkZWZhdWx0LlxuICAgICAgICAgU2V0IHRoaXMgb3B0aW9uIHRvIG92ZXJyaWRlIHRoYXQgZGVmYXVsdCBhbmQgYWx3YXlzIHVzZSB5YXJuLlxuXG4gICAgICR7Ym9sZChcIi0tZXhjbHVkZSA8cmVnZXhwPlwiKX1cblxuICAgICAgICAgSWdub3JlIHBhdGhzIG1hdGNoaW5nIHRoZSByZWdleHAgd2hlbiBjcmVhdGluZyBwYXRjaCBmaWxlcy5cbiAgICAgICAgIFBhdGhzIGFyZSByZWxhdGl2ZSB0byB0aGUgcm9vdCBkaXIgb2YgdGhlIHBhY2thZ2UgdG8gYmUgcGF0Y2hlZC5cblxuICAgICAgICAgRGVmYXVsdDogJ3BhY2thZ2VcXFxcLmpzb24kJ1xuXG4gICAgICR7Ym9sZChcIi0taW5jbHVkZSA8cmVnZXhwPlwiKX1cblxuICAgICAgICAgT25seSBjb25zaWRlciBwYXRocyBtYXRjaGluZyB0aGUgcmVnZXhwIHdoZW4gY3JlYXRpbmcgcGF0Y2ggZmlsZXMuXG4gICAgICAgICBQYXRocyBhcmUgcmVsYXRpdmUgdG8gdGhlIHJvb3QgZGlyIG9mIHRoZSBwYWNrYWdlIHRvIGJlIHBhdGNoZWQuXG5cbiAgICAgICAgIERlZmF1bHQgJy4qJ1xuXG4gICAgICR7Ym9sZChcIi0tY2FzZS1zZW5zaXRpdmUtcGF0aC1maWx0ZXJpbmdcIil9XG5cbiAgICAgICAgIE1ha2UgcmVnZXhwcyB1c2VkIGluIC0taW5jbHVkZSBvciAtLWV4Y2x1ZGUgZmlsdGVycyBjYXNlLXNlbnNpdGl2ZS5cbmApXG59XG4iXX0=