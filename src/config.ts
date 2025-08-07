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
    const toLoad = JSON.stringify(config);
    fs.writeFileSync(getConfigFilePath(), toLoad);
}

export function readConfig(): Config{
    const contents = fs.readFileSync(getConfigFilePath(), "utf8");
    const rawConfig = JSON.parse(contents);
    const CONFIG: Config = validateConfig(rawConfig);
    if (CONFIG.dbUrl == "" && CONFIG.currentUserName == ""){
        console.log("Config file read unsuccessful");
    }
    return CONFIG;
}

function getConfigFilePath(): string{
    const home = os.homedir();
    return path.join(home, ".gatorconfig.json")
}

function writeConfig(cfg: Config){
    const configJSON = JSON.stringify(cfg);
    const home = getConfigFilePath();
    fs.writeFileSync(home, configJSON);
}

function validateConfig(rawConfig: any): Config{
    if (!rawConfig.dbUrl || typeof rawConfig.dbUrl !== "string"){
        throw new Error("db_url is required for the config file");
    }


    if (typeof rawConfig === "object" && "dbUrl" in rawConfig
        && "currentUserName" in rawConfig){
        return rawConfig as Config
    }
    else return {dbUrl: "string", currentUserName : ""};
}