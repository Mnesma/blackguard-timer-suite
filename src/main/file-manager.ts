import { app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";

type LoadedFile = {
    contents: string | null;
    createTime: number | null;
    lastUpdateTime: number | null;
};

export class FileManager {
    public static userDataPath = app.getPath("userData");
    public static myDocumentsPath = app.getPath("documents");

    public async saveJson(filePath: string, json: object): Promise<void> {
        try {
            await this.saveFile(filePath, JSON.stringify(json));
        } catch (error) {
            console.error(`Failed to save json at: ${filePath}`, error);
        }
    }

    public async saveFile(filePath: string, contents: string): Promise<void> {
        try {
            await fs.writeFile(filePath, contents);
        } catch (error) {
            console.error(`Failed to save file at: ${filePath}`, error);
        }
    }

    public async loadJson(filePath: string): Promise<LoadedFile> {
        const loadedFile = await this.loadFile(filePath);

        if (loadedFile.contents !== null) {
            try {
                const loadedJson = {
                    ...loadedFile,
                    contents: JSON.parse(loadedFile.contents)
                };

                return loadedJson;
            } catch (error) {
                console.error(`Failed to load json at: ${filePath}`, error);
            }
        }

        return loadedFile;
    }

    public async loadFile(filePath: string): Promise<LoadedFile> {
        const file: LoadedFile = {
            contents: null,
            createTime: null,
            lastUpdateTime: null
        };

        try {
            const stats = await fs.stat(filePath);
            const fileContents = await fs.readFile(filePath, {
                encoding: "utf8"
            });

            file.contents = fileContents;
            file.createTime = stats.birthtimeMs;
            file.lastUpdateTime = stats.mtimeMs;
        } catch (error) {
            console.error(`Failed to load file at: ${filePath}`, error);
        }

        return file;
    }

    public async loadFiles(dirPath: string): Promise<LoadedFile[]> {
        const loadedFiles: Promise<LoadedFile>[] = [];

        try {
            const fileNames = await fs.readdir(dirPath);

            for (const fileName of fileNames) {
                const filePath = path.join(dirPath, fileName);
                loadedFiles.push(this.loadFile(filePath));
            }
        } catch (error) {
            console.error(`Failed to load all files from: ${dirPath}`, error);
        }

        return Promise.all(loadedFiles);
    }
}
