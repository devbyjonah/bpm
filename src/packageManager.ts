import path from "path";
import fs from "fs";
import * as tar from "tar";
import {
    ensureDirectoryExists,
    readJsonFile,
    writeJsonFile,
} from "./utils/index";
import { fetchJson, downloadFile } from "./utils/index";
import { resolveVersion } from "./utils/index";

const rootDir = path.resolve(__dirname, "../");
const outputDir = path.resolve(rootDir, "output");
const packageJsonPath = path.resolve(outputDir, "package.json");
const packageLockPath = path.resolve(outputDir, "package-lock.json");
const nodeModulesDir = path.resolve(outputDir, "node_modules");

const ensureOutputDirsExist = () => {
    ensureDirectoryExists(outputDir);
    ensureDirectoryExists(nodeModulesDir);
    if (!fs.existsSync(packageJsonPath)) {
        writeJsonFile(packageJsonPath, { dependencies: {} });
    }
    if (!fs.existsSync(packageLockPath)) {
        writeJsonFile(packageLockPath, { dependencies: {} });
    }
};

const downloadDependency = async (name: string, version: string) => {
    const packageInfo = await fetchJson(`https://registry.npmjs.org/${name}`);
    const resolvedVersion = resolveVersion(
        Object.keys(packageInfo.versions),
        version,
    );

    if (!resolvedVersion) {
        throw new Error(`Could not resolve version for ${name}@${version}`);
    }

    const tarballUrl = packageInfo.versions[resolvedVersion].dist.tarball;
    const packageDir = path.resolve(nodeModulesDir, name);
    const tarballPath = path.join(packageDir, "package.tgz");

    ensureDirectoryExists(packageDir);

    await downloadFile(tarballUrl, tarballPath);
    await tar.x({ file: tarballPath, cwd: packageDir, strip: 1 });
    fs.unlinkSync(tarballPath);

    return {
        dependencies: packageInfo.versions[resolvedVersion].dependencies || {},
        version: resolvedVersion,
        tarballUrl,
    };
};

const downloadDependenciesRecursively = async (
    name: string,
    version: string,
) => {
    const {
        dependencies,
        version: resolvedVersion,
        tarballUrl,
    } = await downloadDependency(name, version);

    const packageLock = readJsonFile(packageLockPath) || { dependencies: {} };
    packageLock.dependencies[name] = { version: resolvedVersion, tarballUrl };
    writeJsonFile(packageLockPath, packageLock);

    for (const [nestedName, nestedVersion] of Object.entries<string>(
        dependencies,
    )) {
        await downloadDependenciesRecursively(nestedName, nestedVersion);
    }
};

const installPackages = async () => {
    ensureOutputDirsExist();

    const packageJson = readJsonFile(packageJsonPath) || { dependencies: {} };
    const packageLock = readJsonFile(packageLockPath) || { dependencies: {} };
    const dependencies = packageJson.dependencies || {};
    const lockDependencies = packageLock.dependencies || {};

    for (const [name, version] of Object.entries<string>(dependencies)) {
        if (lockDependencies[name]) {
            console.log(
                `Using locked version for ${name}@${lockDependencies[name].version}`,
            );
            await downloadDependenciesRecursively(
                name,
                lockDependencies[name].version,
            );
        } else {
            await downloadDependenciesRecursively(name, version);
        }
    }

    console.log("Finished installing packages.");
};

const addPackages = async (packageNames: string[]) => {
    ensureOutputDirsExist();

    const packageJson = readJsonFile(packageJsonPath) || { dependencies: {} };
    const packageLock = readJsonFile(packageLockPath) || { dependencies: {} };
    packageJson.dependencies = packageJson.dependencies || {};
    packageLock.dependencies = packageLock.dependencies || {};

    for (const packageName of packageNames) {
        const [name, version = "latest"] = packageName.split("@");

        const packageInfoUrl = `https://registry.npmjs.org/${name}`;
        try {
            await fetchJson(packageInfoUrl);
            packageJson.dependencies[name] = version;
            const resolvedVersion = resolveVersion(
                Object.keys((await fetchJson(packageInfoUrl)).versions),
                version,
            );
            const tarballUrl = (
                await fetchJson(`${packageInfoUrl}/${resolvedVersion}`)
            ).dist.tarball;
            packageLock.dependencies[name] = {
                version: resolvedVersion,
                tarballUrl,
            };
            console.log(`Added ${name}@${version} to dependencies.`);
        } catch (error) {
            console.error(
                `Failed to fetch ${name}@${version} info from registry.`,
            );
        }
    }

    writeJsonFile(packageJsonPath, packageJson);
    writeJsonFile(packageLockPath, packageLock);
};

export { installPackages, addPackages };
