import {setUser, readConfig} from "./config.js"
import {CommandsRegistry, runCommand, registerCommand, loginHandler,
    registerUserHandler, resetHandler, getUsersHandler, aggregateHandler,
    addFeedHandler, feedsHandler, followHandler, followingHandler, getLoggedInUser, unfollowHandler } from "./commands.js";

export async function main(){
    const registry: CommandsRegistry = {};
    await registerCommand(registry, "login", loginHandler);
    await registerCommand(registry, "register", registerUserHandler);
    await registerCommand(registry, "reset", resetHandler);
    await registerCommand(registry, "users", getUsersHandler);
    await registerCommand(registry, "agg", aggregateHandler);
    await registerCommand(registry, "addfeed", getLoggedInUser(addFeedHandler));
    await registerCommand(registry, "feeds", feedsHandler);
    await registerCommand(registry, "follow", getLoggedInUser(followHandler));
    await registerCommand(registry, "following", getLoggedInUser(followingHandler));
    await registerCommand(registry, "unfollow", getLoggedInUser(unfollowHandler));

    if (process.argv.length < 1) {
        console.error("Need at least one argument");
        process.exit(1);
    }
    const [,,cmd, ...args] = process.argv;
    try {
        await runCommand(registry, cmd, ...args);
    }
    catch(err){
        if (err instanceof Error){
            console.error(`Error running command ${cmd}: ${err.message}`);
        }else{
            console.error(`Error running command ${cmd}: ${err}`);
        }
        process.exit(1);
    }
    process.exit(0);
}

main();