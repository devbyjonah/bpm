import fs from "fs";
import axios from "axios";
import semver from "semver";

export const ensureDirectoryExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

export const readJsonFile = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    return null;
};

export const writeJsonFile = (filePath: string, data: any) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const fetchJson = async (url: string) => {
    const response = await axios.get(url);
    if (response.status !== 200) {
        throw new Error(`Failed to fetch data from ${url}`);
    }
    return response.data;
};

export const downloadFile = async (url: string, outputPath: string) => {
    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
    });
    response.data.pipe(writer);

    return new Promise<void>((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
};

export const resolveVersion = (versions: string[], version: string) => {
    if (version === "latest") {
        return versions.sort(semver.rcompare)[0];
    }
    return semver.maxSatisfying(versions, version);
};
