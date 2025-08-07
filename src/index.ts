import {setUser, readConfig} from "./config.js"

export function main(){
    setUser("Anthony");
    console.log(readConfig());
}

main();