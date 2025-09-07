import {readConfig, setUser} from "./config.js";
import { createUser, getUser, deleteAllUsers, getUsers, User } from "./lib/db/queries/users.js";
import { createFeeds, Feed , getAllFeeds, createFeedFollow, getFeedByURL, getFeedFollowsForUser, deleteFeedFollow} from "./lib/db/queries/feeds.js";
import { FetchFeed, RSSFeed } from "./RSS.js"


type CommandHandler = (cmdName:string, ...args: string[]) => Promise<void>;

type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export function getLoggedInUser(handler: UserCommandHandler): CommandHandler {

    return async (cmdName:string, ...args:string[]) => {
        const userName = readConfig().currentUserName;
        const user = await getUser(userName);
        if (!user) {
            throw new Error(`User ${userName} not found`);
        }
        await handler(cmdName, user, ...args)
    };
}

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

export async function addFeedHandler(cmdName:string, user: User, ...args: string[]){
    if (args.length === 0){
        throw Error("No arguments provided");
    }
    if (args.length === 1){
        throw Error("Need to provide both feed name and url")
    }
    if (args.length > 2){
        throw Error("Too many arguments");
    }

    const currentUser = readConfig().currentUserName;
    const feedName = args[0];
    const feedUrl = args[1];

    const user_id = user.id;

    let feed: RSSFeed;
    try{
        feed = await FetchFeed(feedUrl);
    } catch(err){
        console.log("Feed fetch failed")
        throw err;
    }

    const result = await createFeeds(feedUrl,feedName, user_id);
    await createFeedFollow(feedUrl, user_id);
    printFeed(result, user)
}

export async function feedsHandler(cmdName:string, ...args: string[]) {
    const result = await getAllFeeds();
    for (const feed of result){
        console.log(feed.feedName);
        console.log(`  ${feed.URL}`);
        console.log(`  ${feed.userName}`)
    }
}

export async function followHandler(cmdName:string, user: User, ...args: string[]) {
    if (args.length === 0){
        throw Error("No arguments provided");
    }

    const feedUrl = args[0];

    const userName = user.name;

    const result = await createFeedFollow(feedUrl, user.id);
    for (const obj of result){
        console.log("User: " + obj.user_name);
        console.log("Feed: " + obj.feed_name);
    }
}

export async function followingHandler(cmdName:string, user: User,  ...args: string[]) {
    if (args.length > 0){
        throw Error("Too many arguments provided");
    }

    const followList = await getFeedFollowsForUser(user.id);
    for (const follows of followList){
        console.log(follows.feedName)
    }
}

export async function unfollowHandler(cmdname: string, user: User, ...args: string[]){
    if (args.length == 0){
        throw Error("No arguments provided");
    }
    const feedUrl = args[0];
    await deleteFeedFollow(feedUrl, user.id);
}

export type CommandsRegistry = Record<string, CommandHandler>;

export async function registerCommand(registry: CommandsRegistry, cmdName: string, cmdHandler: CommandHandler) {
    registry[cmdName] = cmdHandler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args:string[] ){
    await registry[cmdName](cmdName, ...args);
}

function printFeed(feed: Feed, user: User){
    console.log("User:");
    console.log(JSON.stringify(user));
    console.log("Feed:");
    console.log(JSON.stringify(feed));
}

