"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var path_1 = require("./path");
var spawnSafe_1 = require("./spawnSafe");
var filterFiles_1 = require("./filterFiles");
var fs_extra_1 = require("fs-extra");
var rimraf_1 = require("rimraf");
var fs_extra_2 = require("fs-extra");
var tmp_1 = require("tmp");
var patchFs_1 = require("./patchFs");
var PackageDetails_1 = require("./PackageDetails");
function printNoPackageFoundError(packageName, packageJsonPath) {
    console.error("No such package " + packageName + "\n\n  File not found: " + packageJsonPath);
}
exports.makePatch = function (packagePathSpecifier, appPath, packageManager, includePaths, excludePaths, patchDir) {
    if (patchDir === void 0) { patchDir = "patches"; }
    var _a;
    var packageDetails = PackageDetails_1.getPatchDetailsFromCliString(packagePathSpecifier);
    if (!packageDetails) {
        console.error("No such package", packagePathSpecifier);
        return;
    }
    var appPackageJson = require(path_1.join(appPath, "package.json"));
    var packagePath = path_1.join(appPath, packageDetails.path);
    var packageJsonPath = path_1.join(packagePath, "package.json");
    if (!fs_extra_1.existsSync(packageJsonPath)) {
        printNoPackageFoundError(packagePathSpecifier, packageJsonPath);
        process.exit(1);
    }
    var packageVersion = require(packageJsonPath).version;
    // packageVersionSpecifier is the version string used by the app package.json
    // it won't be present for nested deps.
    // We need it only for patching deps specified with file:./
    // which I think only happens in tests
    // but might happen in real life too.
    var packageVersionSpecifier = packageDetails.isNested
        ? null
        : appPackageJson.dependencies[packageDetails.name] ||
            appPackageJson.devDependencies[packageDetails.name] ||
            null;
    if (packageVersionSpecifier &&
        packageVersionSpecifier.startsWith("file:") &&
        packageVersionSpecifier[5] !== "/") {
        packageVersionSpecifier =
            "file:" + path_1.resolve(appPath, packageVersionSpecifier.slice(5));
    }
    else {
        packageVersionSpecifier = null;
    }
    var tmpRepo = tmp_1.dirSync({ unsafeCleanup: true });
    var tmpRepoPackagePath = path_1.join(tmpRepo.name, packageDetails.path);
    var tmpRepoNpmRoot = tmpRepoPackagePath.slice(0, -("/node_modules/" + packageDetails.name).length);
    var tmpRepoPackageJsonPath = path_1.join(tmpRepoNpmRoot, "package.json");
    try {
        var patchesDir = path_1.resolve(path_1.join(appPath, patchDir));
        console.info(chalk_1.grey("•"), "Creating temporary folder");
        // make a blank package.json
        fs_extra_1.mkdirpSync(tmpRepoNpmRoot);
        fs_extra_1.writeFileSync(tmpRepoPackageJsonPath, JSON.stringify({
            dependencies: (_a = {},
                _a[packageDetails.name] = packageVersionSpecifier || packageVersion,
                _a),
        }));
        if (packageManager === "yarn") {
            console.info(chalk_1.grey("•"), "Installing " + packageDetails.name + "@" + packageVersion + " with yarn");
            spawnSafe_1.spawnSafeSync("yarn", ["install", "--ignore-engines"], {
                cwd: tmpRepoNpmRoot,
            });
        }
        else {
            console.info(chalk_1.grey("•"), "Installing " + packageDetails.name + "@" + packageVersion + " with npm");
            spawnSafe_1.spawnSafeSync("npm", ["i"], { cwd: tmpRepoNpmRoot });
        }
        var git = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return spawnSafe_1.spawnSafeSync("git", args, {
                cwd: tmpRepo.name,
                env: { HOME: tmpRepo.name },
            });
        };
        // remove nested node_modules just to be safe
        rimraf_1.sync(path_1.join(tmpRepoPackagePath, "node_modules"));
        // remove .git just to be safe
        rimraf_1.sync(path_1.join(tmpRepoPackagePath, "node_modules"));
        // commit the package
        console.info(chalk_1.grey("•"), "Diffing your files with clean files");
        fs_extra_1.writeFileSync(path_1.join(tmpRepo.name, ".gitignore"), "!/node_modules\n\n");
        git("init");
        git("config", "--local", "user.name", "patch-package");
        git("config", "--local", "user.email", "patch@pack.age");
        // remove ignored files first
        filterFiles_1.removeIgnoredFiles(tmpRepoPackagePath, includePaths, excludePaths);
        git("add", "-f", packageDetails.path);
        git("commit", "--allow-empty", "-m", "init");
        // replace package with user's version
        rimraf_1.sync(tmpRepoPackagePath);
        fs_extra_2.copySync(packagePath, tmpRepoPackagePath);
        // remove nested node_modules just to be safe
        rimraf_1.sync(path_1.join(tmpRepoPackagePath, "node_modules"));
        // remove .git just to be safe
        rimraf_1.sync(path_1.join(tmpRepoPackagePath, "node_modules"));
        // also remove ignored files like before
        filterFiles_1.removeIgnoredFiles(tmpRepoPackagePath, includePaths, excludePaths);
        // stage all files
        git("add", "-f", packageDetails.path);
        // get diff of changes
        var diffResult = git("diff", "--cached", "--no-color", "--ignore-space-at-eol", "--no-ext-diff");
        if (diffResult.stdout.length === 0) {
            console.warn("\u2049\uFE0F  Not creating patch file for package '" + packagePathSpecifier + "'");
            console.warn("\u2049\uFE0F  There don't appear to be any changes.");
            process.exit(1);
        }
        else {
            var packageNames = packageDetails.packageNames
                .map(function (name) { return name.replace(/\//g, "+"); })
                .join("++");
            // maybe delete existing
            patchFs_1.getPatchFiles(patchDir).forEach(function (filename) {
                var deets = PackageDetails_1.getPackageDetailsFromPatchFilename(filename);
                if (deets && deets.path === packageDetails.path) {
                    fs_extra_1.unlinkSync(path_1.join(patchDir, filename));
                }
            });
            var patchFileName = packageNames + "+" + packageVersion + ".patch";
            var patchPath = path_1.join(patchesDir, patchFileName);
            if (!fs_extra_1.existsSync(path_1.dirname(patchPath))) {
                // scoped package
                fs_extra_1.mkdirSync(path_1.dirname(patchPath));
            }
            fs_extra_1.writeFileSync(patchPath, diffResult.stdout);
            console.log(chalk_1.green("✔") + " Created file " + patchDir + "/" + patchFileName);
        }
    }
    catch (e) {
        console.error(e);
        throw e;
    }
    finally {
        tmpRepo.removeCallback();
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZVBhdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21ha2VQYXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUFtQztBQUNuQywrQkFBK0M7QUFDL0MseUNBQTJDO0FBRTNDLDZDQUFrRDtBQUNsRCxxQ0FNaUI7QUFDakIsaUNBQXVDO0FBQ3ZDLHFDQUFtQztBQUNuQywyQkFBNkI7QUFDN0IscUNBQXlDO0FBQ3pDLG1EQUd5QjtBQUV6QixTQUFTLHdCQUF3QixDQUMvQixXQUFtQixFQUNuQixlQUF1QjtJQUV2QixPQUFPLENBQUMsS0FBSyxDQUNYLHFCQUFtQixXQUFXLDhCQUVkLGVBQWlCLENBQ2xDLENBQUE7QUFDSCxDQUFDO0FBRVksUUFBQSxTQUFTLEdBQUcsVUFDdkIsb0JBQTRCLEVBQzVCLE9BQWUsRUFDZixjQUE4QixFQUM5QixZQUFvQixFQUNwQixZQUFvQixFQUNwQixRQUE0QjtJQUE1Qix5QkFBQSxFQUFBLG9CQUE0Qjs7SUFFNUIsSUFBTSxjQUFjLEdBQUcsNkNBQTRCLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUV6RSxJQUFJLENBQUMsY0FBYyxFQUFFO1FBQ25CLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtRQUN0RCxPQUFNO0tBQ1A7SUFDRCxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsV0FBSSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFBO0lBQzdELElBQU0sV0FBVyxHQUFHLFdBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3RELElBQU0sZUFBZSxHQUFHLFdBQUksQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUE7SUFFekQsSUFBSSxDQUFDLHFCQUFVLENBQUMsZUFBZSxDQUFDLEVBQUU7UUFDaEMsd0JBQXdCLENBQUMsb0JBQW9CLEVBQUUsZUFBZSxDQUFDLENBQUE7UUFDL0Qs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LENBQUMsQ0FBQTtZQUVGLElBQU0sYUFBYSxHQUFNLFlBQVksU0FBSSxjQUFjLFdBQVEsQ0FBQTtZQUUvRCxJQUFNLFNBQVMsR0FBRyxXQUFJLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFBO1lBQ2pELElBQUksQ0FBQyxxQkFBVSxDQUFDLGNBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFO2dCQUNuQyxpQkFBaUI7Z0JBQ2pCLG9CQUFTLENBQUMsY0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7YUFDOUI7WUFDRCx3QkFBYSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBSSxhQUFLLENBQUMsR0FBRyxDQUFDLHNCQUFpQixRQUFRLFNBQUksYUFBZSxDQUFDLENBQUE7U0FDdkU7S0FDRjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNoQixNQUFNLENBQUMsQ0FBQTtLQUNSO1lBQVM7UUFDUixPQUFPLENBQUMsY0FBYyxFQUFFLENBQUE7S0FDekI7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBncmVlbiwgZ3JleSB9IGZyb20gXCJjaGFsa1wiXG5pbXBvcnQgeyBqb2luLCBkaXJuYW1lLCByZXNvbHZlIH0gZnJvbSBcIi4vcGF0aFwiXG5pbXBvcnQgeyBzcGF3blNhZmVTeW5jIH0gZnJvbSBcIi4vc3Bhd25TYWZlXCJcbmltcG9ydCB7IFBhY2thZ2VNYW5hZ2VyIH0gZnJvbSBcIi4vZGV0ZWN0UGFja2FnZU1hbmFnZXJcIlxuaW1wb3J0IHsgcmVtb3ZlSWdub3JlZEZpbGVzIH0gZnJvbSBcIi4vZmlsdGVyRmlsZXNcIlxuaW1wb3J0IHtcbiAgd3JpdGVGaWxlU3luYyxcbiAgZXhpc3RzU3luYyxcbiAgbWtkaXJTeW5jLFxuICB1bmxpbmtTeW5jLFxuICBta2RpcnBTeW5jLFxufSBmcm9tIFwiZnMtZXh0cmFcIlxuaW1wb3J0IHsgc3luYyBhcyByaW1yYWYgfSBmcm9tIFwicmltcmFmXCJcbmltcG9ydCB7IGNvcHlTeW5jIH0gZnJvbSBcImZzLWV4dHJhXCJcbmltcG9ydCB7IGRpclN5bmMgfSBmcm9tIFwidG1wXCJcbmltcG9ydCB7IGdldFBhdGNoRmlsZXMgfSBmcm9tIFwiLi9wYXRjaEZzXCJcbmltcG9ydCB7XG4gIGdldFBhdGNoRGV0YWlsc0Zyb21DbGlTdHJpbmcsXG4gIGdldFBhY2thZ2VEZXRhaWxzRnJvbVBhdGNoRmlsZW5hbWUsXG59IGZyb20gXCIuL1BhY2thZ2VEZXRhaWxzXCJcblxuZnVuY3Rpb24gcHJpbnROb1BhY2thZ2VGb3VuZEVycm9yKFxuICBwYWNrYWdlTmFtZTogc3RyaW5nLFxuICBwYWNrYWdlSnNvblBhdGg6IHN0cmluZyxcbikge1xuICBjb25zb2xlLmVycm9yKFxuICAgIGBObyBzdWNoIHBhY2thZ2UgJHtwYWNrYWdlTmFtZX1cblxuICBGaWxlIG5vdCBmb3VuZDogJHtwYWNrYWdlSnNvblBhdGh9YCxcbiAgKVxufVxuXG5leHBvcnQgY29uc3QgbWFrZVBhdGNoID0gKFxuICBwYWNrYWdlUGF0aFNwZWNpZmllcjogc3RyaW5nLFxuICBhcHBQYXRoOiBzdHJpbmcsXG4gIHBhY2thZ2VNYW5hZ2VyOiBQYWNrYWdlTWFuYWdlcixcbiAgaW5jbHVkZVBhdGhzOiBSZWdFeHAsXG4gIGV4Y2x1ZGVQYXRoczogUmVnRXhwLFxuICBwYXRjaERpcjogc3RyaW5nID0gXCJwYXRjaGVzXCIsXG4pID0+IHtcbiAgY29uc3QgcGFja2FnZURldGFpbHMgPSBnZXRQYXRjaERldGFpbHNGcm9tQ2xpU3RyaW5nKHBhY2thZ2VQYXRoU3BlY2lmaWVyKVxuXG4gIGlmICghcGFja2FnZURldGFpbHMpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiTm8gc3VjaCBwYWNrYWdlXCIsIHBhY2thZ2VQYXRoU3BlY2lmaWVyKVxuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IGFwcFBhY2thZ2VKc29uID0gcmVxdWlyZShqb2luKGFwcFBhdGgsIFwicGFja2FnZS5qc29uXCIpKVxuICBjb25zdCBwYWNrYWdlUGF0aCA9IGpvaW4oYXBwUGF0aCwgcGFja2FnZURldGFpbHMucGF0aClcbiAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gam9pbihwYWNrYWdlUGF0aCwgXCJwYWNrYWdlLmpzb25cIilcblxuICBpZiAoIWV4aXN0c1N5bmMocGFja2FnZUpzb25QYXRoKSkge1xuICAgIHByaW50Tm9QYWNrYWdlRm91bmRFcnJvcihwYWNrYWdlUGF0aFNwZWNpZmllciwgcGFja2FnZUpzb25QYXRoKVxuICAgIHByb2Nlc3MuZXhpdCgxKVxuICB9XG5cbiAgY29uc3QgcGFja2FnZVZlcnNpb24gPSByZXF1aXJlKHBhY2thZ2VKc29uUGF0aCkudmVyc2lvbiBhcyBzdHJpbmdcblxuICAvLyBwYWNrYWdlVmVyc2lvblNwZWNpZmllciBpcyB0aGUgdmVyc2lvbiBzdHJpbmcgdXNlZCBieSB0aGUgYXBwIHBhY2thZ2UuanNvblxuICAvLyBpdCB3b24ndCBiZSBwcmVzZW50IGZvciBuZXN0ZWQgZGVwcy5cbiAgLy8gV2UgbmVlZCBpdCBvbmx5IGZvciBwYXRjaGluZyBkZXBzIHNwZWNpZmllZCB3aXRoIGZpbGU6Li9cbiAgLy8gd2hpY2ggSSB0aGluayBvbmx5IGhhcHBlbnMgaW4gdGVzdHNcbiAgLy8gYnV0IG1pZ2h0IGhhcHBlbiBpbiByZWFsIGxpZmUgdG9vLlxuICBsZXQgcGFja2FnZVZlcnNpb25TcGVjaWZpZXI6IG51bGwgfCBzdHJpbmcgPSBwYWNrYWdlRGV0YWlscy5pc05lc3RlZFxuICAgID8gbnVsbFxuICAgIDogYXBwUGFja2FnZUpzb24uZGVwZW5kZW5jaWVzW3BhY2thZ2VEZXRhaWxzLm5hbWVdIHx8XG4gICAgICBhcHBQYWNrYWdlSnNvbi5kZXZEZXBlbmRlbmNpZXNbcGFja2FnZURldGFpbHMubmFtZV0gfHxcbiAgICAgIG51bGxcblxuICBpZiAoXG4gICAgcGFja2FnZVZlcnNpb25TcGVjaWZpZXIgJiZcbiAgICBwYWNrYWdlVmVyc2lvblNwZWNpZmllci5zdGFydHNXaXRoKFwiZmlsZTpcIikgJiZcbiAgICBwYWNrYWdlVmVyc2lvblNwZWNpZmllcls1XSAhPT0gXCIvXCJcbiAgKSB7XG4gICAgcGFja2FnZVZlcnNpb25TcGVjaWZpZXIgPVxuICAgICAgXCJmaWxlOlwiICsgcmVzb2x2ZShhcHBQYXRoLCBwYWNrYWdlVmVyc2lvblNwZWNpZmllci5zbGljZSg1KSlcbiAgfSBlbHNlIHtcbiAgICBwYWNrYWdlVmVyc2lvblNwZWNpZmllciA9IG51bGxcbiAgfVxuXG4gIGNvbnN0IHRtcFJlcG8gPSBkaXJTeW5jKHsgdW5zYWZlQ2xlYW51cDogdHJ1ZSB9KVxuICBjb25zdCB0bXBSZXBvUGFja2FnZVBhdGggPSBqb2luKHRtcFJlcG8ubmFtZSwgcGFja2FnZURldGFpbHMucGF0aClcbiAgY29uc3QgdG1wUmVwb05wbVJvb3QgPSB0bXBSZXBvUGFja2FnZVBhdGguc2xpY2UoXG4gICAgMCxcbiAgICAtYC9ub2RlX21vZHVsZXMvJHtwYWNrYWdlRGV0YWlscy5uYW1lfWAubGVuZ3RoLFxuICApXG5cbiAgY29uc3QgdG1wUmVwb1BhY2thZ2VKc29uUGF0aCA9IGpvaW4odG1wUmVwb05wbVJvb3QsIFwicGFja2FnZS5qc29uXCIpXG5cbiAgdHJ5IHtcbiAgICBjb25zdCBwYXRjaGVzRGlyID0gcmVzb2x2ZShqb2luKGFwcFBhdGgsIHBhdGNoRGlyKSlcblxuICAgIGNvbnNvbGUuaW5mbyhncmV5KFwi4oCiXCIpLCBcIkNyZWF0aW5nIHRlbXBvcmFyeSBmb2xkZXJcIilcblxuICAgIC8vIG1ha2UgYSBibGFuayBwYWNrYWdlLmpzb25cbiAgICBta2RpcnBTeW5jKHRtcFJlcG9OcG1Sb290KVxuICAgIHdyaXRlRmlsZVN5bmMoXG4gICAgICB0bXBSZXBvUGFja2FnZUpzb25QYXRoLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBkZXBlbmRlbmNpZXM6IHtcbiAgICAgICAgICBbcGFja2FnZURldGFpbHMubmFtZV06IHBhY2thZ2VWZXJzaW9uU3BlY2lmaWVyIHx8IHBhY2thZ2VWZXJzaW9uLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgaWYgKHBhY2thZ2VNYW5hZ2VyID09PSBcInlhcm5cIikge1xuICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICBncmV5KFwi4oCiXCIpLFxuICAgICAgICBgSW5zdGFsbGluZyAke3BhY2thZ2VEZXRhaWxzLm5hbWV9QCR7cGFja2FnZVZlcnNpb259IHdpdGggeWFybmAsXG4gICAgICApXG4gICAgICBzcGF3blNhZmVTeW5jKGB5YXJuYCwgW1wiaW5zdGFsbFwiLCBcIi0taWdub3JlLWVuZ2luZXNcIl0sIHtcbiAgICAgICAgY3dkOiB0bXBSZXBvTnBtUm9vdCxcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgZ3JleShcIuKAolwiKSxcbiAgICAgICAgYEluc3RhbGxpbmcgJHtwYWNrYWdlRGV0YWlscy5uYW1lfUAke3BhY2thZ2VWZXJzaW9ufSB3aXRoIG5wbWAsXG4gICAgICApXG4gICAgICBzcGF3blNhZmVTeW5jKGBucG1gLCBbXCJpXCJdLCB7IGN3ZDogdG1wUmVwb05wbVJvb3QgfSlcbiAgICB9XG5cbiAgICBjb25zdCBnaXQgPSAoLi4uYXJnczogc3RyaW5nW10pID0+XG4gICAgICBzcGF3blNhZmVTeW5jKFwiZ2l0XCIsIGFyZ3MsIHtcbiAgICAgICAgY3dkOiB0bXBSZXBvLm5hbWUsXG4gICAgICAgIGVudjogeyBIT01FOiB0bXBSZXBvLm5hbWUgfSxcbiAgICAgIH0pXG5cbiAgICAvLyByZW1vdmUgbmVzdGVkIG5vZGVfbW9kdWxlcyBqdXN0IHRvIGJlIHNhZmVcbiAgICByaW1yYWYoam9pbih0bXBSZXBvUGFja2FnZVBhdGgsIFwibm9kZV9tb2R1bGVzXCIpKVxuICAgIC8vIHJlbW92ZSAuZ2l0IGp1c3QgdG8gYmUgc2FmZVxuICAgIHJpbXJhZihqb2luKHRtcFJlcG9QYWNrYWdlUGF0aCwgXCJub2RlX21vZHVsZXNcIikpXG5cbiAgICAvLyBjb21taXQgdGhlIHBhY2thZ2VcbiAgICBjb25zb2xlLmluZm8oZ3JleShcIuKAolwiKSwgXCJEaWZmaW5nIHlvdXIgZmlsZXMgd2l0aCBjbGVhbiBmaWxlc1wiKVxuICAgIHdyaXRlRmlsZVN5bmMoam9pbih0bXBSZXBvLm5hbWUsIFwiLmdpdGlnbm9yZVwiKSwgXCIhL25vZGVfbW9kdWxlc1xcblxcblwiKVxuICAgIGdpdChcImluaXRcIilcbiAgICBnaXQoXCJjb25maWdcIiwgXCItLWxvY2FsXCIsIFwidXNlci5uYW1lXCIsIFwicGF0Y2gtcGFja2FnZVwiKVxuICAgIGdpdChcImNvbmZpZ1wiLCBcIi0tbG9jYWxcIiwgXCJ1c2VyLmVtYWlsXCIsIFwicGF0Y2hAcGFjay5hZ2VcIilcblxuICAgIC8vIHJlbW92ZSBpZ25vcmVkIGZpbGVzIGZpcnN0XG4gICAgcmVtb3ZlSWdub3JlZEZpbGVzKHRtcFJlcG9QYWNrYWdlUGF0aCwgaW5jbHVkZVBhdGhzLCBleGNsdWRlUGF0aHMpXG5cbiAgICBnaXQoXCJhZGRcIiwgXCItZlwiLCBwYWNrYWdlRGV0YWlscy5wYXRoKVxuICAgIGdpdChcImNvbW1pdFwiLCBcIi0tYWxsb3ctZW1wdHlcIiwgXCItbVwiLCBcImluaXRcIilcblxuICAgIC8vIHJlcGxhY2UgcGFja2FnZSB3aXRoIHVzZXIncyB2ZXJzaW9uXG4gICAgcmltcmFmKHRtcFJlcG9QYWNrYWdlUGF0aClcblxuICAgIGNvcHlTeW5jKHBhY2thZ2VQYXRoLCB0bXBSZXBvUGFja2FnZVBhdGgpXG5cbiAgICAvLyByZW1vdmUgbmVzdGVkIG5vZGVfbW9kdWxlcyBqdXN0IHRvIGJlIHNhZmVcbiAgICByaW1yYWYoam9pbih0bXBSZXBvUGFja2FnZVBhdGgsIFwibm9kZV9tb2R1bGVzXCIpKVxuICAgIC8vIHJlbW92ZSAuZ2l0IGp1c3QgdG8gYmUgc2FmZVxuICAgIHJpbXJhZihqb2luKHRtcFJlcG9QYWNrYWdlUGF0aCwgXCJub2RlX21vZHVsZXNcIikpXG5cbiAgICAvLyBhbHNvIHJlbW92ZSBpZ25vcmVkIGZpbGVzIGxpa2UgYmVmb3JlXG4gICAgcmVtb3ZlSWdub3JlZEZpbGVzKHRtcFJlcG9QYWNrYWdlUGF0aCwgaW5jbHVkZVBhdGhzLCBleGNsdWRlUGF0aHMpXG5cbiAgICAvLyBzdGFnZSBhbGwgZmlsZXNcbiAgICBnaXQoXCJhZGRcIiwgXCItZlwiLCBwYWNrYWdlRGV0YWlscy5wYXRoKVxuXG4gICAgLy8gZ2V0IGRpZmYgb2YgY2hhbmdlc1xuICAgIGNvbnN0IGRpZmZSZXN1bHQgPSBnaXQoXG4gICAgICBcImRpZmZcIixcbiAgICAgIFwiLS1jYWNoZWRcIixcbiAgICAgIFwiLS1uby1jb2xvclwiLFxuICAgICAgXCItLWlnbm9yZS1zcGFjZS1hdC1lb2xcIixcbiAgICAgIFwiLS1uby1leHQtZGlmZlwiLFxuICAgIClcblxuICAgIGlmIChkaWZmUmVzdWx0LnN0ZG91dC5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgYOKBie+4jyAgTm90IGNyZWF0aW5nIHBhdGNoIGZpbGUgZm9yIHBhY2thZ2UgJyR7cGFja2FnZVBhdGhTcGVjaWZpZXJ9J2AsXG4gICAgICApXG4gICAgICBjb25zb2xlLndhcm4oYOKBie+4jyAgVGhlcmUgZG9uJ3QgYXBwZWFyIHRvIGJlIGFueSBjaGFuZ2VzLmApXG4gICAgICBwcm9jZXNzLmV4aXQoMSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcGFja2FnZU5hbWVzID0gcGFja2FnZURldGFpbHMucGFja2FnZU5hbWVzXG4gICAgICAgIC5tYXAobmFtZSA9PiBuYW1lLnJlcGxhY2UoL1xcLy9nLCBcIitcIikpXG4gICAgICAgIC5qb2luKFwiKytcIilcblxuICAgICAgLy8gbWF5YmUgZGVsZXRlIGV4aXN0aW5nXG4gICAgICBnZXRQYXRjaEZpbGVzKHBhdGNoRGlyKS5mb3JFYWNoKGZpbGVuYW1lID0+IHtcbiAgICAgICAgY29uc3QgZGVldHMgPSBnZXRQYWNrYWdlRGV0YWlsc0Zyb21QYXRjaEZpbGVuYW1lKGZpbGVuYW1lKVxuICAgICAgICBpZiAoZGVldHMgJiYgZGVldHMucGF0aCA9PT0gcGFja2FnZURldGFpbHMucGF0aCkge1xuICAgICAgICAgIHVubGlua1N5bmMoam9pbihwYXRjaERpciwgZmlsZW5hbWUpKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBjb25zdCBwYXRjaEZpbGVOYW1lID0gYCR7cGFja2FnZU5hbWVzfSske3BhY2thZ2VWZXJzaW9ufS5wYXRjaGBcblxuICAgICAgY29uc3QgcGF0Y2hQYXRoID0gam9pbihwYXRjaGVzRGlyLCBwYXRjaEZpbGVOYW1lKVxuICAgICAgaWYgKCFleGlzdHNTeW5jKGRpcm5hbWUocGF0Y2hQYXRoKSkpIHtcbiAgICAgICAgLy8gc2NvcGVkIHBhY2thZ2VcbiAgICAgICAgbWtkaXJTeW5jKGRpcm5hbWUocGF0Y2hQYXRoKSlcbiAgICAgIH1cbiAgICAgIHdyaXRlRmlsZVN5bmMocGF0Y2hQYXRoLCBkaWZmUmVzdWx0LnN0ZG91dClcbiAgICAgIGNvbnNvbGUubG9nKGAke2dyZWVuKFwi4pyUXCIpfSBDcmVhdGVkIGZpbGUgJHtwYXRjaERpcn0vJHtwYXRjaEZpbGVOYW1lfWApXG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKVxuICAgIHRocm93IGVcbiAgfSBmaW5hbGx5IHtcbiAgICB0bXBSZXBvLnJlbW92ZUNhbGxiYWNrKClcbiAgfVxufVxuIl19