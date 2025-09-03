import os from "os";
import fs from "fs";
import path from "path";

type Config = {
    dbUrl: string;
    currentUserName: string;
}

export function setUser(user: string){
    const config: Config = readConfig()
    config.currentUserName = user;
    writeConfig(config);
}

export function readConfig(): Config{
    const data = fs.readFileSync(getConfigFilePath(), "utf8");
    const rawConfig = JSON.parse(data);
    const config: Config = validateConfig(rawConfig);
    return config;
}

function getConfigFilePath(): string{
    const configFileName = ".gatorconfig.json"
    const home = os.homedir();
    return path.join(home, configFileName);
}

function writeConfig(cfg: Config){
    const configJSON = JSON.stringify(cfg, null, 2);
    const home = getConfigFilePath();
    fs.writeFileSync(home, configJSON, {encoding: "utf-8"});
}

function validateConfig(rawConfig: any): Config{
    if (!rawConfig.dbUrl || typeof rawConfig.dbUrl !== "string"){
        throw new Error("db_url is required for the config file");
    }
    if (!rawConfig.currentUserName || typeof rawConfig.currentUserName !== "string"){
        throw new Error("current_user_name is required for the config file");
    }

    const config: Config = {
        dbUrl: rawConfig.dbUrl,
        currentUserName: rawConfig.currentUserName,
    };

    return config;
}