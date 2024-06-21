import { installPackages, addPackages } from "./packageManager";

const command = process.argv[2];
const packageNames = process.argv.slice(3);

(async () => {
    try {
        switch (command) {
            case "add":
                if (packageNames.length === 0) {
                    console.log(
                        'Usage: "node dist/index.js add package1 package2"',
                    );
                } else {
                    await addPackages(packageNames);
                }
                break;
            case "install":
                await installPackages();
                break;
            default:
                console.log(
                    "Unsupported command. Supported commands: add, install",
                );
                break;
        }
    } catch (error) {
        console.error(`Error executing command: ${error}`);
    }
})();
