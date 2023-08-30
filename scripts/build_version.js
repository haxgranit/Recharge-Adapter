const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// path to config file
const fileLocation = path.resolve(__dirname, "../config/version.json");

/**
 * Run pull version from git and store in a config file.
 */
exec("git status", (error, stdout, stderr) => {
    if (error) {
        console.error(`error: ${error.message}`);
    }

    if (stderr) {
        console.error(`stderror: ${stderr}`);
    }

    // Search for git keywords and pull out branch as version
    const matches = stdout.match(/On branch (?<version>.*)$/im);
    let version;

    try {
        version = matches.groups.version.trim();
    } catch (e) {
        version = "version/undefined";
    }

    try {
        console.log(`Version: ${version}`);
        // create new file for use in app
        fs.writeFileSync(fileLocation, JSON.stringify({ ui: version }, undefined, 3), {
            encoding: "utf8",
            flag: "w",
        });
    } catch (e) {
        console.error(e);
    }
});

/**
 * Wait for file to exist.
 */
function checkExistsWithTimeout() {
    const filePath = fileLocation;
    const timeout = 10000;

    return new Promise(function (resolve, reject) {
        var timer = setTimeout(function () {
            watcher.close();
            reject(new Error("File did not exists and was not created during the timeout."));
        }, timeout);

        fs.access(filePath, fs.constants.R_OK, function (err) {
            if (!err) {
                clearTimeout(timer);
                watcher.close();
                resolve();
            }
        });

        var dir = path.dirname(filePath);
        var basename = path.basename(filePath);
        var watcher = fs.watch(dir, function (eventType, filename) {
            if (eventType === "rename" && filename === basename) {
                clearTimeout(timer);
                watcher.close();
                resolve();
            }
        });
    });
}

module.exports = async () => await checkExistsWithTimeout();
