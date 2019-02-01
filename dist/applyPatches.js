"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var patchFs_1 = require("./patchFs");
var apply_1 = require("./patch/apply");
var fs_extra_1 = require("fs-extra");
var path_1 = require("./path");
var path_2 = require("path");
var PackageDetails_1 = require("./PackageDetails");
var parse_1 = require("./patch/parse");
var reverse_1 = require("./patch/reverse");
var is_ci_1 = __importDefault(require("is-ci"));
// don't want to exit(1) on postinsall locally.
// see https://github.com/ds300/patch-package/issues/86
var shouldExitPostinstallWithError = is_ci_1.default || process.env.NODE_ENV === "test";
function findPatchFiles(patchesDirectory) {
    if (!fs_extra_1.existsSync(patchesDirectory)) {
        return [];
    }
    return patchFs_1.getPatchFiles(patchesDirectory);
}
function getInstalledPackageVersion(_a) {
    var appPath = _a.appPath, path = _a.path, pathSpecifier = _a.pathSpecifier;
    var packageDir = path_1.join(appPath, path);
    if (!fs_extra_1.existsSync(packageDir)) {
        console.log(chalk_1.yellow("Warning:") + " Patch file found for package " + path_2.posix.basename(pathSpecifier) + (" which is not present at " + packageDir));
        return null;
    }
    return require(path_1.join(packageDir, "package.json")).version;
}
exports.applyPatchesForApp = function (appPath, reverse, patchDir) {
    if (patchDir === void 0) { patchDir = "patches"; }
    var patchesDirectory = path_1.join(appPath, patchDir);
    var files = findPatchFiles(patchesDirectory);
    if (files.length === 0) {
        console.error(chalk_1.red("No patch files found"));
        return;
    }
    files.forEach(function (filename) {
        var details = PackageDetails_1.getPackageDetailsFromPatchFilename(filename);
        if (!details) {
            console.warn("Unrecognized patch file in patches directory " + filename);
            return;
        }
        var name = details.name, version = details.version, path = details.path, pathSpecifier = details.pathSpecifier;
        var installedPackageVersion = getInstalledPackageVersion({
            appPath: appPath,
            path: path,
            pathSpecifier: pathSpecifier,
        });
        if (!installedPackageVersion) {
            return;
        }
        if (exports.applyPatch(path_1.resolve(patchesDirectory, filename), reverse)) {
            // yay patch was applied successfully
            // print warning if version mismatch
            if (installedPackageVersion !== version) {
                printVersionMismatchWarning({
                    packageName: name,
                    actualVersion: installedPackageVersion,
                    originalVersion: version,
                    pathSpecifier: pathSpecifier,
                    path: path,
                });
            }
            else {
                console.log(chalk_1.bold(pathSpecifier) + "@" + version + " " + chalk_1.green("✔"));
            }
        }
        else {
            // completely failed to apply patch
            // TODO: propagate useful error messages from patch application
            if (installedPackageVersion === version) {
                printBrokenPatchFileError({
                    packageName: name,
                    patchFileName: filename,
                    pathSpecifier: pathSpecifier,
                    path: path,
                });
            }
            else {
                printPatchApplictionFailureError({
                    packageName: name,
                    actualVersion: installedPackageVersion,
                    originalVersion: version,
                    patchFileName: filename,
                    path: path,
                    pathSpecifier: pathSpecifier,
                });
            }
            process.exit(shouldExitPostinstallWithError ? 1 : 0);
        }
    });
};
exports.applyPatch = function (patchFilePath, reverse) {
    var patchFileContents = fs_extra_1.readFileSync(patchFilePath).toString();
    var patch = parse_1.parsePatchFile(patchFileContents);
    try {
        apply_1.executeEffects(reverse ? reverse_1.reversePatch(patch) : patch, { dryRun: false });
    }
    catch (e) {
        try {
            apply_1.executeEffects(reverse ? patch : reverse_1.reversePatch(patch), { dryRun: true });
        }
        catch (e) {
            return false;
        }
    }
    return true;
};
function printVersionMismatchWarning(_a) {
    var packageName = _a.packageName, actualVersion = _a.actualVersion, originalVersion = _a.originalVersion, pathSpecifier = _a.pathSpecifier, path = _a.path;
    console.warn("\n" + chalk_1.red("Warning:") + " patch-package detected a patch file version mismatch\n\n  Don't worry! This is probably fine. The patch was still applied\n  successfully. Here's the deets:\n\n  Patch file created for\n\n    " + packageName + "@" + chalk_1.bold(originalVersion) + "\n\n  applied to\n\n    " + packageName + "@" + chalk_1.bold(actualVersion) + "\n  \n  At path\n  \n    " + path + "\n\n  This warning is just to give you a heads-up. There is a small chance of\n  breakage even though the patch was applied successfully. Make sure the package\n  still behaves like you expect (you wrote tests, right?) and then run\n\n    " + chalk_1.bold("patch-package " + pathSpecifier) + "\n\n  to update the version in the patch file name and make this warning go away.\n");
}
function printBrokenPatchFileError(_a) {
    var packageName = _a.packageName, patchFileName = _a.patchFileName, path = _a.path, pathSpecifier = _a.pathSpecifier;
    console.error("\n" + chalk_1.red.bold("**ERROR**") + " " + chalk_1.red("Failed to apply patch for package " + chalk_1.bold(packageName) + " at path") + "\n  \n    " + path + "\n\n  This error was caused because patch-package cannot apply the following patch file:\n\n    patches/" + patchFileName + "\n\n  Try removing node_modules and trying again. If that doesn't work, maybe there was\n  an accidental change made to the patch file? Try recreating it by manually\n  editing the appropriate files and running:\n  \n    patch-package " + pathSpecifier + "\n  \n  If that doesn't work, then it's a bug in patch-package, so please submit a bug\n  report. Thanks!\n\n    https://github.com/ds300/patch-package/issues\n    \n");
}
function printPatchApplictionFailureError(_a) {
    var packageName = _a.packageName, actualVersion = _a.actualVersion, originalVersion = _a.originalVersion, patchFileName = _a.patchFileName, path = _a.path, pathSpecifier = _a.pathSpecifier;
    console.error("\n" + chalk_1.red.bold("**ERROR**") + " " + chalk_1.red("Failed to apply patch for package " + chalk_1.bold(packageName) + " at path") + "\n  \n    " + path + "\n\n  This error was caused because " + chalk_1.bold(packageName) + " has changed since you\n  made the patch file for it. This introduced conflicts with your patch,\n  just like a merge conflict in Git when separate incompatible changes are\n  made to the same piece of code.\n\n  Maybe this means your patch file is no longer necessary, in which case\n  hooray! Just delete it!\n\n  Otherwise, you need generate a new patch file.\n\n  To generate a new one, just repeat the steps you made to generate the first\n  one.\n\n  i.e. manually make the appropriate file changes, then run \n\n    patch-package " + pathSpecifier + "\n\n  Info:\n    Patch file: patches/" + patchFileName + "\n    Patch was made for version: " + chalk_1.green.bold(originalVersion) + "\n    Installed version: " + chalk_1.red.bold(actualVersion) + "\n");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbHlQYXRjaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcGx5UGF0Y2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLCtCQUFnRDtBQUNoRCxxQ0FBeUM7QUFDekMsdUNBQThDO0FBQzlDLHFDQUFtRDtBQUNuRCwrQkFBc0M7QUFDdEMsNkJBQTRCO0FBQzVCLG1EQUFxRTtBQUNyRSx1Q0FBOEM7QUFDOUMsMkNBQThDO0FBQzlDLGdEQUF3QjtBQUV4QiwrQ0FBK0M7QUFDL0MsdURBQXVEO0FBQ3ZELElBQU0sOEJBQThCLEdBQUcsZUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLE1BQU0sQ0FBQTtBQUU5RSxTQUFTLGNBQWMsQ0FBQyxnQkFBd0I7SUFDOUMsSUFBSSxDQUFDLHFCQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUNqQyxPQUFPLEVBQUUsQ0FBQTtLQUNWO0lBRUQsT0FBTyx1QkFBYSxDQUFDLGdCQUFnQixDQUFhLENBQUE7QUFDcEQsQ0FBQztBQUVELFNBQVMsMEJBQTBCLENBQUMsRUFRbkM7UUFQQyxvQkFBTyxFQUNQLGNBQUksRUFDSixnQ0FBYTtJQU1iLElBQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDdEMsSUFBSSxDQUFDLHFCQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FDTixjQUFNLENBQUMsVUFBVSxDQUFDLHNDQUFpQyxZQUFLLENBQUMsUUFBUSxDQUNsRSxhQUFhLENBQ1osSUFBRyw4QkFBNEIsVUFBWSxDQUFBLENBQy9DLENBQUE7UUFFRCxPQUFPLElBQUksQ0FBQTtLQUNaO0lBRUQsT0FBTyxPQUFPLENBQUMsV0FBSSxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQTtBQUMxRCxDQUFDO0FBRVksUUFBQSxrQkFBa0IsR0FBRyxVQUNo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LFdBQUcsQ0FDMUIsdUNBQXFDLFlBQUksQ0FBQyxXQUFXLENBQUMsYUFBVSxDQUNqRSxrQkFFRyxJQUFJLDRDQUV3QixZQUFJLENBQUMsV0FBVyxDQUFDLGlpQkFlL0IsYUFBYSw2Q0FHUCxhQUFhLDBDQUNMLGFBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGlDQUNwQyxXQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUMvQyxDQUFDLENBQUE7QUFDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYm9sZCwgZ3JlZW4sIHJlZCwgeWVsbG93IH0gZnJvbSBcImNoYWxrXCJcbmltcG9ydCB7IGdldFBhdGNoRmlsZXMgfSBmcm9tIFwiLi9wYXRjaEZzXCJcbmltcG9ydCB7IGV4ZWN1dGVFZmZlY3RzIH0gZnJvbSBcIi4vcGF0Y2gvYXBwbHlcIlxuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzLWV4dHJhXCJcbmltcG9ydCB7IGpvaW4sIHJlc29sdmUgfSBmcm9tIFwiLi9wYXRoXCJcbmltcG9ydCB7IHBvc2l4IH0gZnJvbSBcInBhdGhcIlxuaW1wb3J0IHsgZ2V0UGFja2FnZURldGFpbHNGcm9tUGF0Y2hGaWxlbmFtZSB9IGZyb20gXCIuL1BhY2thZ2VEZXRhaWxzXCJcbmltcG9ydCB7IHBhcnNlUGF0Y2hGaWxlIH0gZnJvbSBcIi4vcGF0Y2gvcGFyc2VcIlxuaW1wb3J0IHsgcmV2ZXJzZVBhdGNoIH0gZnJvbSBcIi4vcGF0Y2gvcmV2ZXJzZVwiXG5pbXBvcnQgaXNDaSBmcm9tIFwiaXMtY2lcIlxuXG4vLyBkb24ndCB3YW50IHRvIGV4aXQoMSkgb24gcG9zdGluc2FsbCBsb2NhbGx5LlxuLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9kczMwMC9wYXRjaC1wYWNrYWdlL2lzc3Vlcy84NlxuY29uc3Qgc2hvdWxkRXhpdFBvc3RpbnN0YWxsV2l0aEVycm9yID0gaXNDaSB8fCBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJ0ZXN0XCJcblxuZnVuY3Rpb24gZmluZFBhdGNoRmlsZXMocGF0Y2hlc0RpcmVjdG9yeTogc3RyaW5nKTogc3RyaW5nW10ge1xuICBpZiAoIWV4aXN0c1N5bmMocGF0Y2hlc0RpcmVjdG9yeSkpIHtcbiAgICByZXR1cm4gW11cbiAgfVxuXG4gIHJldHVybiBnZXRQYXRjaEZpbGVzKHBhdGNoZXNEaXJlY3RvcnkpIGFzIHN0cmluZ1tdXG59XG5cbmZ1bmN0aW9uIGdldEluc3RhbGxlZFBhY2thZ2VWZXJzaW9uKHtcbiAgYXBwUGF0aCxcbiAgcGF0aCxcbiAgcGF0aFNwZWNpZmllcixcbn06IHtcbiAgYXBwUGF0aDogc3RyaW5nXG4gIHBhdGg6IHN0cmluZ1xuICBwYXRoU3BlY2lmaWVyOiBzdHJpbmdcbn0pOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgcGFja2FnZURpciA9IGpvaW4oYXBwUGF0aCwgcGF0aClcbiAgaWYgKCFleGlzdHNTeW5jKHBhY2thZ2VEaXIpKSB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICBgJHt5ZWxsb3coXCJXYXJuaW5nOlwiKX0gUGF0Y2ggZmlsZSBmb3VuZCBmb3IgcGFja2FnZSAke3Bvc2l4LmJhc2VuYW1lKFxuICAgICAgICBwYXRoU3BlY2lmaWVyLFxuICAgICAgKX1gICsgYCB3aGljaCBpcyBub3QgcHJlc2VudCBhdCAke3BhY2thZ2VEaXJ9YCxcbiAgICApXG5cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgcmV0dXJuIHJlcXVpcmUoam9pbihwYWNrYWdlRGlyLCBcInBhY2thZ2UuanNvblwiKSkudmVyc2lvblxufVxuXG5leHBvcnQgY29uc3QgYXBwbHlQYXRjaGVzRm9yQXBwID0gKFxuICBhcHBQYXRoOiBzdHJpbmcsXG4gIHJldmVyc2U6IGJvb2xlYW4sXG4gIHBhdGNoRGlyOiBzdHJpbmcgPSBcInBhdGNoZXNcIixcbik6IHZvaWQgPT4ge1xuICBjb25zdCBwYXRjaGVzRGlyZWN0b3J5ID0gam9pbihhcHBQYXRoLCBwYXRjaERpcilcbiAgY29uc3QgZmlsZXMgPSBmaW5kUGF0Y2hGaWxlcyhwYXRjaGVzRGlyZWN0b3J5KVxuXG4gIGlmIChmaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICBjb25zb2xlLmVycm9yKHJlZChcIk5vIHBhdGNoIGZpbGVzIGZvdW5kXCIpKVxuICAgIHJldHVyblxuICB9XG5cbiAgZmlsZXMuZm9yRWFjaChmaWxlbmFtZSA9PiB7XG4gICAgY29uc3QgZGV0YWlscyA9IGdldFBhY2thZ2VEZXRhaWxzRnJvbVBhdGNoRmlsZW5hbWUoZmlsZW5hbWUpXG5cbiAgICBpZiAoIWRldGFpbHMpIHtcbiAgICAgIGNvbnNvbGUud2FybihgVW5yZWNvZ25pemVkIHBhdGNoIGZpbGUgaW4gcGF0Y2hlcyBkaXJlY3RvcnkgJHtmaWxlbmFtZX1gKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgeyBuYW1lLCB2ZXJzaW9uLCBwYXRoLCBwYXRoU3BlY2lmaWVyIH0gPSBkZXRhaWxzXG5cbiAgICBjb25zdCBpbnN0YWxsZWRQYWNrYWdlVmVyc2lvbiA9IGdldEluc3RhbGxlZFBhY2thZ2VWZXJzaW9uKHtcbiAgICAgIGFwcFBhdGgsXG4gICAgICBwYXRoLFxuICAgICAgcGF0aFNwZWNpZmllcixcbiAgICB9KVxuXG4gICAgaWYgKCFpbnN0YWxsZWRQYWNrYWdlVmVyc2lvbikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGFwcGx5UGF0Y2gocmVzb2x2ZShwYXRjaGVzRGlyZWN0b3J5LCBmaWxlbmFtZSkgYXMgc3RyaW5nLCByZXZlcnNlKSkge1xuICAgICAgLy8geWF5IHBhdGNoIHdhcyBhcHBsaWVkIHN1Y2Nlc3NmdWxseVxuICAgICAgLy8gcHJpbnQgd2FybmluZyBpZiB2ZXJzaW9uIG1pc21hdGNoXG4gICAgICBpZiAoaW5zdGFsbGVkUGFja2FnZVZlcnNpb24gIT09IHZlcnNpb24pIHtcbiAgICAgICAgcHJpbnRWZXJzaW9uTWlzbWF0Y2hXYXJuaW5nKHtcbiAgICAgICAgICBwYWNrYWdlTmFtZTogbmFtZSxcbiAgICAgICAgICBhY3R1YWxWZXJzaW9uOiBpbnN0YWxsZWRQYWNrYWdlVmVyc2lvbixcbiAgICAgICAgICBvcmlnaW5hbFZlcnNpb246IHZlcnNpb24sXG4gICAgICAgICAgcGF0aFNwZWNpZmllcixcbiAgICAgICAgICBwYXRoLFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYCR7Ym9sZChwYXRoU3BlY2lmaWVyKX1AJHt2ZXJzaW9ufSAke2dyZWVuKFwi4pyUXCIpfWApXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbXBsZXRlbHkgZmFpbGVkIHRvIGFwcGx5IHBhdGNoXG4gICAgICAvLyBUT0RPOiBwcm9wYWdhdGUgdXNlZnVsIGVycm9yIG1lc3NhZ2VzIGZyb20gcGF0Y2ggYXBwbGljYXRpb25cbiAgICAgIGlmIChpbnN0YWxsZWRQYWNrYWdlVmVyc2lvbiA9PT0gdmVyc2lvbikge1xuICAgICAgICBwcmludEJyb2tlblBhdGNoRmlsZUVycm9yKHtcbiAgICAgICAgICBwYWNrYWdlTmFtZTogbmFtZSxcbiAgICAgICAgICBwYXRjaEZpbGVOYW1lOiBmaWxlbmFtZSxcbiAgICAgICAgICBwYXRoU3BlY2lmaWVyLFxuICAgICAgICAgIHBhdGgsXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcmludFBhdGNoQXBwbGljdGlvbkZhaWx1cmVFcnJvcih7XG4gICAgICAgICAgcGFja2FnZU5hbWU6IG5hbWUsXG4gICAgICAgICAgYWN0dWFsVmVyc2lvbjogaW5zdGFsbGVkUGFja2FnZVZlcnNpb24sXG4gICAgICAgICAgb3JpZ2luYWxWZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgICAgIHBhdGNoRmlsZU5hbWU6IGZpbGVuYW1lLFxuICAgICAgICAgIHBhdGgsXG4gICAgICAgICAgcGF0aFNwZWNpZmllcixcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHByb2Nlc3MuZXhpdChzaG91bGRFeGl0UG9zdGluc3RhbGxXaXRoRXJyb3IgPyAxIDogMClcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBjb25zdCBhcHBseVBhdGNoID0gKFxuICBwYXRjaEZpbGVQYXRoOiBzdHJpbmcsXG4gIHJldmVyc2U6IGJvb2xlYW4sXG4pOiBib29sZWFuID0+IHtcbiAgY29uc3QgcGF0Y2hGaWxlQ29udGVudHMgPSByZWFkRmlsZVN5bmMocGF0Y2hGaWxlUGF0aCkudG9TdHJpbmcoKVxuICBjb25zdCBwYXRjaCA9IHBhcnNlUGF0Y2hGaWxlKHBhdGNoRmlsZUNvbnRlbnRzKVxuICB0cnkge1xuICAgIGV4ZWN1dGVFZmZlY3RzKHJldmVyc2UgPyByZXZlcnNlUGF0Y2gocGF0Y2gpIDogcGF0Y2gsIHsgZHJ5UnVuOiBmYWxzZSB9KVxuICB9IGNhdGNoIChlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGV4ZWN1dGVFZmZlY3RzKHJldmVyc2UgPyBwYXRjaCA6IHJldmVyc2VQYXRjaChwYXRjaCksIHsgZHJ5UnVuOiB0cnVlIH0pXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcHJpbnRWZXJzaW9uTWlzbWF0Y2hXYXJuaW5nKHtcbiAgcGFja2FnZU5hbWUsXG4gIGFjdHVhbFZlcnNpb24sXG4gIG9yaWdpbmFsVmVyc2lvbixcbiAgcGF0aFNwZWNpZmllcixcbiAgcGF0aCxcbn06IHtcbiAgcGFja2FnZU5hbWU6IHN0cmluZ1xuICBhY3R1YWxWZXJzaW9uOiBzdHJpbmdcbiAgb3JpZ2luYWxWZXJzaW9uOiBzdHJpbmdcbiAgcGF0aFNwZWNpZmllcjogc3RyaW5nXG4gIHBhdGg6IHN0cmluZ1xufSkge1xuICBjb25zb2xlLndhcm4oYFxuJHtyZWQoXCJXYXJuaW5nOlwiKX0gcGF0Y2gtcGFja2FnZSBkZXRlY3RlZCBhIHBhdGNoIGZpbGUgdmVyc2lvbiBtaXNtYXRjaFxuXG4gIERvbid0IHdvcnJ5ISBUaGlzIGlzIHByb2JhYmx5IGZpbmUuIFRoZSBwYXRjaCB3YXMgc3RpbGwgYXBwbGllZFxuICBzdWNjZXNzZnVsbHkuIEhlcmUncyB0aGUgZGVldHM6XG5cbiAgUGF0Y2ggZmlsZSBjcmVhdGVkIGZvclxuXG4gICAgJHtwYWNrYWdlTmFtZX1AJHtib2xkKG9yaWdpbmFsVmVyc2lvbil9XG5cbiAgYXBwbGllZCB0b1xuXG4gICAgJHtwYWNrYWdlTmFtZX1AJHtib2xkKGFjdHVhbFZlcnNpb24pfVxuICBcbiAgQXQgcGF0aFxuICBcbiAgICAke3BhdGh9XG5cbiAgVGhpcyB3YXJuaW5nIGlzIGp1c3QgdG8gZ2l2ZSB5b3UgYSBoZWFkcy11cC4gVGhlcmUgaXMgYSBzbWFsbCBjaGFuY2Ugb2ZcbiAgYnJlYWthZ2UgZXZlbiB0aG91Z2ggdGhlIHBhdGNoIHdhcyBhcHBsaWVkIHN1Y2Nlc3NmdWxseS4gTWFrZSBzdXJlIHRoZSBwYWNrYWdlXG4gIHN0aWxsIGJlaGF2ZXMgbGlrZSB5b3UgZXhwZWN0ICh5b3Ugd3JvdGUgdGVzdHMsIHJpZ2h0PykgYW5kIHRoZW4gcnVuXG5cbiAgICAke2JvbGQoYHBhdGNoLXBhY2thZ2UgJHtwYXRoU3BlY2lmaWVyfWApfVxuXG4gIHRvIHVwZGF0ZSB0aGUgdmVyc2lvbiBpbiB0aGUgcGF0Y2ggZmlsZSBuYW1lIGFuZCBtYWtlIHRoaXMgd2FybmluZyBnbyBhd2F5LlxuYClcbn1cblxuZnVuY3Rpb24gcHJpbnRCcm9rZW5QYXRjaEZpbGVFcnJvcih7XG4gIHBhY2thZ2VOYW1lLFxuICBwYXRjaEZpbGVOYW1lLFxuICBwYXRoLFxuICBwYXRoU3BlY2lmaWVyLFxufToge1xuICBwYWNrYWdlTmFtZTogc3RyaW5nXG4gIHBhdGNoRmlsZU5hbWU6IHN0cmluZ1xuICBwYXRoOiBzdHJpbmdcbiAgcGF0aFNwZWNpZmllcjogc3RyaW5nXG59KSB7XG4gIGNvbnNvbGUuZXJyb3IoYFxuJHtyZWQuYm9sZChcIioqRVJST1IqKlwiKX0gJHtyZWQoXG4gICAgYEZhaWxlZCB0byBhcHBseSBwYXRjaCBmb3IgcGFja2FnZSAke2JvbGQocGFja2FnZU5hbWUpfSBhdCBwYXRoYCxcbiAgKX1cbiAgXG4gICAgJHtwYXRofVxuXG4gIFRoaXMgZXJyb3Igd2FzIGNhdXNlZCBiZWNhdXNlIHBhdGNoLXBhY2thZ2UgY2Fubm90IGFwcGx5IHRoZSBmb2xsb3dpbmcgcGF0Y2ggZmlsZTpcblxuICAgIHBhdGNoZXMvJHtwYXRjaEZpbGVOYW1lfVxuXG4gIFRyeSByZW1vdmluZyBub2RlX21vZHVsZXMgYW5kIHRyeWluZyBhZ2Fpbi4gSWYgdGhhdCBkb2Vzbid0IHdvcmssIG1heWJlIHRoZXJlIHdhc1xuICBhbiBhY2NpZGVudGFsIGNoYW5nZSBtYWRlIHRvIHRoZSBwYXRjaCBmaWxlPyBUcnkgcmVjcmVhdGluZyBpdCBieSBtYW51YWxseVxuICBlZGl0aW5nIHRoZSBhcHByb3ByaWF0ZSBmaWxlcyBhbmQgcnVubmluZzpcbiAgXG4gICAgcGF0Y2gtcGFja2FnZSAke3BhdGhTcGVjaWZpZXJ9XG4gIFxuICBJZiB0aGF0IGRvZXNuJ3Qgd29yaywgdGhlbiBpdCdzIGEgYnVnIGluIHBhdGNoLXBhY2thZ2UsIHNvIHBsZWFzZSBzdWJtaXQgYSBidWdcbiAgcmVwb3J0LiBUaGFua3MhXG5cbiAgICBodHRwczovL2dpdGh1Yi5jb20vZHMzMDAvcGF0Y2gtcGFja2FnZS9pc3N1ZXNcbiAgICBcbmApXG59XG5cbmZ1bmN0aW9uIHByaW50UGF0Y2hBcHBsaWN0aW9uRmFpbHVyZUVycm9yKHtcbiAgcGFja2FnZU5hbWUsXG4gIGFjdHVhbFZlcnNpb24sXG4gIG9yaWdpbmFsVmVyc2lvbixcbiAgcGF0Y2hGaWxlTmFtZSxcbiAgcGF0aCxcbiAgcGF0aFNwZWNpZmllcixcbn06IHtcbiAgcGFja2FnZU5hbWU6IHN0cmluZ1xuICBhY3R1YWxWZXJzaW9uOiBzdHJpbmdcbiAgb3JpZ2luYWxWZXJzaW9uOiBzdHJpbmdcbiAgcGF0Y2hGaWxlTmFtZTogc3RyaW5nXG4gIHBhdGg6IHN0cmluZ1xuICBwYXRoU3BlY2lmaWVyOiBzdHJpbmdcbn0pIHtcbiAgY29uc29sZS5lcnJvcihgXG4ke3JlZC5ib2xkKFwiKipFUlJPUioqXCIpfSAke3JlZChcbiAgICBgRmFpbGVkIHRvIGFwcGx5IHBhdGNoIGZvciBwYWNrYWdlICR7Ym9sZChwYWNrYWdlTmFtZSl9IGF0IHBhdGhgLFxuICApfVxuICBcbiAgICAke3BhdGh9XG5cbiAgVGhpcyBlcnJvciB3YXMgY2F1c2VkIGJlY2F1c2UgJHtib2xkKHBhY2thZ2VOYW1lKX0gaGFzIGNoYW5nZWQgc2luY2UgeW91XG4gIG1hZGUgdGhlIHBhdGNoIGZpbGUgZm9yIGl0LiBUaGlzIGludHJvZHVjZWQgY29uZmxpY3RzIHdpdGggeW91ciBwYXRjaCxcbiAganVzdCBsaWtlIGEgbWVyZ2UgY29uZmxpY3QgaW4gR2l0IHdoZW4gc2VwYXJhdGUgaW5jb21wYXRpYmxlIGNoYW5nZXMgYXJlXG4gIG1hZGUgdG8gdGhlIHNhbWUgcGllY2Ugb2YgY29kZS5cblxuICBNYXliZSB0aGlzIG1lYW5zIHlvdXIgcGF0Y2ggZmlsZSBpcyBubyBsb25nZXIgbmVjZXNzYXJ5LCBpbiB3aGljaCBjYXNlXG4gIGhvb3JheSEgSnVzdCBkZWxldGUgaXQhXG5cbiAgT3RoZXJ3aXNlLCB5b3UgbmVlZCBnZW5lcmF0ZSBhIG5ldyBwYXRjaCBmaWxlLlxuXG4gIFRvIGdlbmVyYXRlIGEgbmV3IG9uZSwganVzdCByZXBlYXQgdGhlIHN0ZXBzIHlvdSBtYWRlIHRvIGdlbmVyYXRlIHRoZSBmaXJzdFxuICBvbmUuXG5cbiAgaS5lLiBtYW51YWxseSBtYWtlIHRoZSBhcHByb3ByaWF0ZSBmaWxlIGNoYW5nZXMsIHRoZW4gcnVuIFxuXG4gICAgcGF0Y2gtcGFja2FnZSAke3BhdGhTcGVjaWZpZXJ9XG5cbiAgSW5mbzpcbiAgICBQYXRjaCBmaWxlOiBwYXRjaGVzLyR7cGF0Y2hGaWxlTmFtZX1cbiAgICBQYXRjaCB3YXMgbWFkZSBmb3IgdmVyc2lvbjogJHtncmVlbi5ib2xkKG9yaWdpbmFsVmVyc2lvbil9XG4gICAgSW5zdGFsbGVkIHZlcnNpb246ICR7cmVkLmJvbGQoYWN0dWFsVmVyc2lvbil9XG5gKVxufVxuIl19