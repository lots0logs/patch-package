"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = require("./path");
var chalk_1 = __importDefault(require("chalk"));
var process_1 = __importDefault(require("process"));
function printNoYarnLockfileError() {
    console.error("\n" + chalk_1.default.red.bold("**ERROR**") + " " + chalk_1.default.red("The --use-yarn option was specified but there is no yarn.lock file") + "\n");
}
function printNoLockfilesError() {
    console.error("\n" + chalk_1.default.red.bold("**ERROR**") + " " + chalk_1.default.red("No package-lock.json, npm-shrinkwrap.json, or yarn.lock file.\n\nYou must use either npm@>=5, yarn, or npm-shrinkwrap to manage this project's\ndependencies.") + "\n");
}
function printSelectingDefaultMessage() {
    console.info(chalk_1.default.bold("patch-package") + ": you have both yarn.lock and package-lock.json\nDefaulting to using " + chalk_1.default.bold("npm") + "\nYou can override this setting by passing --use-yarn or deleting\npackage-lock.json if you don't need it\n");
}
exports.detectPackageManager = function (appRootPath, overridePackageManager) {
    var packageLockExists = fs_extra_1.default.existsSync(path_1.join(appRootPath, "package-lock.json"));
    var shrinkWrapExists = fs_extra_1.default.existsSync(path_1.join(appRootPath, "npm-shrinkwrap.json"));
    var yarnLockExists = fs_extra_1.default.existsSync(path_1.join(appRootPath, "yarn.lock"));
    if ((packageLockExists || shrinkWrapExists) && yarnLockExists) {
        if (overridePackageManager) {
            return overridePackageManager;
        }
        else {
            printSelectingDefaultMessage();
            return shrinkWrapExists ? "npm-shrinkwrap" : "npm";
        }
    }
    else if (packageLockExists || shrinkWrapExists) {
        if (overridePackageManager === "yarn") {
            printNoYarnLockfileError();
            process_1.default.exit(1);
        }
        else {
            return shrinkWrapExists ? "npm-shrinkwrap" : "npm";
        }
    }
    else if (yarnLockExists) {
        return "yarn";
    }
    else {
        printNoLockfilesError();
        process_1.default.exit(1);
    }
    throw Error();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0ZWN0UGFja2FnZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGV0ZWN0UGFja2FnZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBeUI7QUFDekIsK0JBQTZCO0FBQzdCLGdEQUF5QjtBQUN6QixvREFBNkI7QUFJN0IsU0FBUyx3QkFBd0I7SUFDL0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUNkLGVBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFJLGVBQUssQ0FBQyxHQUFHLENBQ3RDLG9FQUFvRSxDQUNyRSxPQUNGLENBQUMsQ0FBQTtBQUNGLENBQUM7QUFFRCxTQUFTLHFCQUFxQjtJQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQ2QsZUFBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQUksZUFBSyxDQUFDLEdBQUcsQ0FDdEMsK0pBR1UsQ0FDWCxPQUNGLENBQUMsQ0FBQTtBQUNGLENBQUM7QUFFRCxTQUFTLDRCQUE0QjtJQUNuQyxPQUFPLENBQUMsSUFBSSxDQUNQLGVBQUssQ0FBQyxJQUFJLENBQ1gsZUFBZSxDQUNoQiw2RUFDaUIsZUFBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0hBR3RDLENBQ0UsQ0FBQTtBQUNILENBQUM7QUFFWSxRQUFBLG9CQUFvQixHQUFHLFVBQ2xDLFdBQW1CLEVBQ25CLHNCQUE2QztJQUU3QyxJQUFNLGlCQUFpQixHQUFHLGtCQUFFLENBQUMsVUFBVSxDQUNyQyxXQUFJLENBQUMsV0FBVyxFQUFFLG1CQUFtQixDQUFDLENBQ3ZDLENBQUE7SUFDRCxJQUFNLGdCQUFnQixHQUFHLGtCQUFFLENBQUMsVUFBVSxDQUNwQyxXQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixDQUFDLENBQ3pDLENBQUE7SUFDRCxJQUFNLGNBQWMsR0FBRyxrQkFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFJLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUE7SUFDcEUsSUFBSSxDQUFDLGlCQUFpQixJQUFJLGdCQUFnQixDQUFDLElBQUksY0FBYyxFQUFFO1FBQzdELElBQUksc0JBQXNCLEVBQUU7WUFDMUIsT0FBTyxzQkFBc0IsQ0FBQTtTQUM5QjthQUFNO1lBQ0wsNEJBQTRCLEVBQUUsQ0FBQTtZQUM5QixPQUFPLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO1NBQ25EO0tBQ0Y7U0FBTSxJQUFJLGlCQUFpQixJQUFJLGdCQUFnQixFQUFFO1FBQ2hELElBQUksc0JBQXNCLEtBQUssTUFBTSxFQUFFO1lBQ3JDLHdCQUF3QixFQUFFLENBQUE7WUFDMUIsaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDaEI7YUFBTTtZQUNMLE9BQU8sZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7U0FDbkQ7S0FDRjtTQUFNLElBQUksY0FBYyxFQUFFO1FBQ3pCLE9BQU8sTUFBTSxDQUFBO0tBQ2Q7U0FBTTtRQUNMLHFCQUFxQixFQUFFLENBQUE7UUFDdkIsaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDaEI7SUFDRCxNQUFNLEtBQUssRUFBRSxDQUFBO0FBQ2YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gXCJmcy1leHRyYVwiXG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcIi4vcGF0aFwiXG5pbXBvcnQgY2hhbGsgZnJvbSBcImNoYWxrXCJcbmltcG9ydCBwcm9jZXNzIGZyb20gXCJwcm9jZXNzXCJcblxuZXhwb3J0IHR5cGUgUGFja2FnZU1hbmFnZXIgPSBcInlhcm5cIiB8IFwibnBtXCIgfCBcIm5wbS1zaHJpbmt3cmFwXCJcblxuZnVuY3Rpb24gcHJpbnROb1lhcm5Mb2NrZmlsZUVycm9yKCkge1xuICBjb25zb2xlLmVycm9yKGBcbiR7Y2hhbGsucmVkLmJvbGQoXCIqKkVSUk9SKipcIil9ICR7Y2hhbGsucmVkKFxuICAgIGBUaGUgLS11c2UteWFybiBvcHRpb24gd2FzIHNwZWNpZmllZCBidXQgdGhlcmUgaXMgbm8geWFybi5sb2NrIGZpbGVgLFxuICApfVxuYClcbn1cblxuZnVuY3Rpb24gcHJpbnROb0xvY2tmaWxlc0Vycm9yKCkge1xuICBjb25zb2xlLmVycm9yKGBcbiR7Y2hhbGsucmVkLmJvbGQoXCIqKkVSUk9SKipcIil9ICR7Y2hhbGsucmVkKFxuICAgIGBObyBwYWNrYWdlLWxvY2suanNvbiwgbnBtLXNocmlua3dyYXAuanNvbiwgb3IgeWFybi5sb2NrIGZpbGUuXG5cbllvdSBtdXN0IHVzZSBlaXRoZXIgbnBtQD49NSwgeWFybiwgb3IgbnBtLXNocmlua3dyYXAgdG8gbWFuYWdlIHRoaXMgcHJvamVjdCdzXG5kZXBlbmRlbmNpZXMuYCxcbiAgKX1cbmApXG59XG5cbmZ1bmN0aW9uIHByaW50U2VsZWN0aW5nRGVmYXVsdE1lc3NhZ2UoKSB7XG4gIGNvbnNvbGUuaW5mbyhcbiAgICBgJHtjaGFsay5ib2xkKFxuICAgICAgXCJwYXRjaC1wYWNrYWdlXCIsXG4gICAgKX06IHlvdSBoYXZlIGJvdGggeWFybi5sb2NrIGFuZCBwYWNrYWdlLWxvY2suanNvblxuRGVmYXVsdGluZyB0byB1c2luZyAke2NoYWxrLmJvbGQoXCJucG1cIil9XG5Zb3UgY2FuIG92ZXJyaWRlIHRoaXMgc2V0dGluZyBieSBwYXNzaW5nIC0tdXNlLXlhcm4gb3IgZGVsZXRpbmdcbnBhY2thZ2UtbG9jay5qc29uIGlmIHlvdSBkb24ndCBuZWVkIGl0XG5gLFxuICApXG59XG5cbmV4cG9ydCBjb25zdCBkZXRlY3RQYWNrYWdlTWFuYWdlciA9IChcbiAgYXBwUm9vdFBhdGg6IHN0cmluZyxcbiAgb3ZlcnJpZGVQYWNrYWdlTWFuYWdlcjogUGFja2FnZU1hbmFnZXIgfCBudWxsLFxuKTogUGFja2FnZU1hbmFnZXIgPT4ge1xuICBjb25zdCBwYWNrYWdlTG9ja0V4aXN0cyA9IGZzLmV4aXN0c1N5bmMoXG4gICAgam9pbihhcHBSb290UGF0aCwgXCJwYWNrYWdlLWxvY2suanNvblwiKSxcbiAgKVxuICBjb25zdCBzaHJpbmtXcmFwRXhpc3RzID0gZnMuZXhpc3RzU3luYyhcbiAgICBqb2luKGFwcFJvb3RQYXRoLCBcIm5wbS1zaHJpbmt3cmFwLmpzb25cIiksXG4gIClcbiAgY29uc3QgeWFybkxvY2tFeGlzdHMgPSBmcy5leGlzdHNTeW5jKGpvaW4oYXBwUm9vdFBhdGgsIFwieWFybi5sb2NrXCIpKVxuICBpZiAoKHBhY2thZ2VMb2NrRXhpc3RzIHx8IHNocmlua1dyYXBFeGlzdHMpICYmIHlhcm5Mb2NrRXhpc3RzKSB7XG4gICAgaWYgKG92ZXJyaWRlUGFja2FnZU1hbmFnZXIpIHtcbiAgICAgIHJldHVybiBvdmVycmlkZVBhY2thZ2VNYW5hZ2VyXG4gICAgfSBlbHNlIHtcbiAgICAgIHByaW50U2VsZWN0aW5nRGVmYXVsdE1lc3NhZ2UoKVxuICAgICAgcmV0dXJuIHNocmlua1dyYXBFeGlzdHMgPyBcIm5wbS1zaHJpbmt3cmFwXCIgOiBcIm5wbVwiXG4gICAgfVxuICB9IGVsc2UgaWYgKHBhY2thZ2VMb2NrRXhpc3RzIHx8IHNocmlua1dyYXBFeGlzdHMpIHtcbiAgICBpZiAob3ZlcnJpZGVQYWNrYWdlTWFuYWdlciA9PT0gXCJ5YXJuXCIpIHtcbiAgICAgIHByaW50Tm9ZYXJuTG9ja2ZpbGVFcnJvcigpXG4gICAgICBwcm9jZXNzLmV4aXQoMSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNocmlua1dyYXBFeGlzdHMgPyBcIm5wbS1zaHJpbmt3cmFwXCIgOiBcIm5wbVwiXG4gICAgfVxuICB9IGVsc2UgaWYgKHlhcm5Mb2NrRXhpc3RzKSB7XG4gICAgcmV0dXJuIFwieWFyblwiXG4gIH0gZWxzZSB7XG4gICAgcHJpbnROb0xvY2tmaWxlc0Vycm9yKClcbiAgICBwcm9jZXNzLmV4aXQoMSlcbiAgfVxuICB0aHJvdyBFcnJvcigpXG59XG4iXX0=