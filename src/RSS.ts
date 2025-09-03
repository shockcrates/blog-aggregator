import {XMLParser} from 'fast-xml-parser';

export type RSSFeed = {
    channel:{
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    }
}
export type RSSItem = {
    title: string;
    link: string;
    description:string;
    pubDate: string;
}
export async function FetchFeed(feedURL: string){
    const response = await fetch(feedURL,{
        method:"GET",
        headers:{
            'User-Agent': "gator"
        }
    });
    const responseText = await response.text();

    const parser = new XMLParser();
    const responseJSON = parser.parse(responseText).rss;
    //console.log("TEXT: " + JSON.stringify(responseJSON));
    if (!("channel" in responseJSON)) {
        throw Error("No channel found for feed");
    }
    if (!("title" in responseJSON.channel && "link" in responseJSON.channel && "description" in responseJSON.channel)){
        throw Error("Missing field from channel");
    }
    const title = responseJSON.channel.title;
    const link = responseJSON.channel.link;
    const description = responseJSON.channel.description;

    let feedItems: RSSItem[] = [];
    if ("item" in responseJSON.channel){
        if (!Array.isArray(responseJSON.channel.item)){
            responseJSON.channel.item = [];
        }
        for (let item of responseJSON.channel.item) {
            if ("title" in item && "link" in item && "description" in item && "pubDate" in item) {
                feedItems.push({
                    title: item.title,
                    link: item.link,
                    description: item.description,
                    pubDate: item.pubDate
                });
            }
        }
    }
    const result: RSSFeed = {
        channel: {
            title: title,
            link: link,
            description: description,
            item: feedItems
        }
    }
    return result;
}
