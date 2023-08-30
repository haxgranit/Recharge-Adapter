const { exec } = require("child_process");

/**
 * @returns
 */
exec("node scripts/changed_files.js --staged", (error, stdin) => {
    if (error) {
        return;
    }

    exec(`npx vue-cli-service lint ${stdin.replace(/\r?\n/m, " ")}`, (error, stdin, stderr) => {
        if (error) {
            console.error(stderr);
            return;
        }

        console.log(stdin);
    });
});
