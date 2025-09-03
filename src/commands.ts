import {readConfig, setUser} from "./config.js";
import { createUser, getUser, deleteAllUsers, getUsers } from "./lib/db/queries/users.js";
import { FetchFeed, RSSFeed } from "./RSS.js"


type CommandHandler = (cmdName:string, ...args: string[]) => Promise<void>;

export async function loginHandler(cmdName:string, ...args: string[]) {
    if (args.length ===0){
        throw Error("No arguments provided");
    }
    const username = args[0];

    const result = await getUser(username);
    if (result === undefined){
        throw Error("User does not exist");
    }

    setUser(username);
    console.log("User has been set.");

}

export async function registerUserHandler(cmdName:string, ...args: string[]) {
    if (!(typeof args[0] == "string")) {
        throw Error("user must be a name");
    }

    //const get_result = await getUser(args[0]);
    //console.log("Get result: ");
    //console.log(JSON.stringify(get_result));
    try {
        const result = await createUser(args[0]);
        console.log(`Created user ${args[0]}: ` + JSON.stringify(result));
        setUser(result.name);

    } catch (err){
        throw err;
    }
}

export async function resetHandler(){
    try {
        const result = await deleteAllUsers();
        console.log("Users Cleared");
    } catch (err){
        throw err;
    }
}

export async function getUsersHandler(cmdName:string, ...args: string[]) {
    try{
        const result = await getUsers();
        const currentUser = readConfig().currentUserName;
        for (const user of result){
            if (user.name === currentUser){
                console.log(`* ${user.name} (current)`);
            }
            else{
                console.log(`* ${user.name}`);
            }
        }
    } catch(err){
        throw err;
    }
}

export async function aggregateHandler(cmdName:string, ...args: string[]) {
    const FeedUrl = args[0];
    const rssFeed = await FetchFeed("https://www.wagslane.dev/index.xml");

    console.log(JSON.stringify(rssFeed));
}



export type CommandsRegistry = Record<string, CommandHandler>;

export async function registerCommand(registry: CommandsRegistry, cmdName: string, cmdHandler: CommandHandler) {
    registry[cmdName] = cmdHandler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args:string[] ){
    await registry[cmdName](cmdName, ...args);
}

