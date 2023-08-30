const { exec } = require("child_process");

const tracking = { 1: "staged", 2: "unstaged", 4: "untracked" };
const track_map = Object.entries(tracking).reduce((acc, [val, key]) => {
    acc[key] = parseInt(val, 10);
    return acc;
}, {});

let options = { tracking: 1 };

/**
 * Process args and builds options object.
 *
 * @returns {object} Resolved options object.
 */
function processArgs() {
    const opts = {};

    for (let skip = true, i = 0; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg === __filename) {
            skip = false;
            continue;
        }
        if (skip) {
            continue;
        }

        const matches = arg.match(/(--)(?<arg>\w+)/);
        if (!matches) {
            continue;
        }

        switch (matches.groups.arg) {
            case "staged":
            case "unstaged":
            case "untracked":
                opts.tracking = (opts.tracking | 0) + track_map[matches.groups.arg];
                break;
        }
    }
    return opts;
}

options = Object.assign({}, options, processArgs());

exec("git status", (error, stdout) => {
    if (error) {
        return console.error("Unable to get list of files");
    }

    const files = {};
    let key = undefined;

    stdout.split("\n").forEach((line) => {
        const key_matches = line.match(
            /(?<tracked>Untracked files:|Changes to be committed:|Changes not staged for commit:)/i
        );
        switch (key_matches && key_matches.groups.tracked) {
            case "Untracked files:":
                key = "untracked";
                return;
            case "Changes to be committed:":
                key = "staged";
                return;
            case "Changes not staged for commit:":
                key = "unstaged";
                return;
            default:
                break;
        }

        const file_matches = line.match(/^\s+(?<file>[^(]*)/);
        if (!file_matches || !file_matches.groups.file) {
            return;
        }

        if (!files[key]) {
            files[key] = [];
        }

        if (/deleted:/.test(file_matches.groups.file)) {
            return;
        }

        const filename = file_matches.groups.file.replace(/^(new file|modified):\s+/, "").trim();
        files[key].push(filename);
    });

    const selected_files = new Set();
    for (let i = options.tracking, count = 1; i > 0; i >>= 1, count <<= 1) {
        const key = tracking[(i & 1) * count];
        if (key) {
            files[key].forEach((file) => selected_files.add(file));
        }
    }

    const file_list = Array.from(selected_files);
    if (file_list.length <= 0) {
        console.error("No modified files");
        return 1;
    }

    console.log(file_list.join("\n"));
    return 0;
});
