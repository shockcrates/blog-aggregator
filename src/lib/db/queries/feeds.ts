import {db} from "..";
import {feed_follows, feeds, users} from "../schema.js";
import {and, asc, eq, sql} from "drizzle-orm";

export async function createFeeds(feedURL: string, name: string, userId: string){
    const [result] = await db.insert(feeds).values({ name: name, url: feedURL, user_id: userId }).returning();
    return result;
}

export async function getAllFeeds(){
    const result = db.select({
        feedName: feeds.name,
        URL: feeds.url,
        userName: users.name
    }).from(feeds).innerJoin(users, eq(feeds.user_id, users.id))

    return result;
}

export async function getFeedByURL(feedURL: string){
    const [result] = await db.select().from(feeds).where(eq(feeds.url, feedURL));
    return result;
}

export async function markFeedFetched(feedId: string){
    const [result] = await db.update(feeds).set({lastFetchedAt: sql`now()`}).where(eq(feeds.id, feedId)).returning();
    return result;
}

export async function getNextFeedToFetch(){
    const [result] = await db.select().from(feeds).orderBy(sql`"lastFetchedAt" ASC NULLS FIRST`);
    return result;
}

export type Feed = typeof feeds.$inferSelect;

export async function createFeedFollow(feedURL: string, user_id: string){
    const feedInfo = await getFeedByURL(feedURL);
    const [newFF] = await db.insert(feed_follows).values({feed_id: feedInfo.id, user_id: user_id}).returning();
    const result = await db.select({
        id: feed_follows.id,
        feed_id: feed_follows.feed_id,
        feed_name: feeds.name,
        user_id: feed_follows.user_id,
        user_name: users.name
    }).from(feed_follows)
        .innerJoin(feeds, eq(feed_follows.user_id, feeds.id))
        .innerJoin(users, eq(feed_follows.feed_id, users.id));
    return result;
}

export async function deleteFeedFollow(feedURL: string, user_id: string){
    const [sq] = await db.select().from(feeds).where(eq(feeds.url, feedURL));
    const [result] = await db
        .delete(feed_follows)
        .where(and(eq(feed_follows.user_id, user_id), eq(feed_follows.feed_id, sq.id)))

    return result;
}

export async function getFeedFollowsForUser(userId: string){
    const result = await db.select({feedName: feeds.name}).from(feed_follows).where(eq( feed_follows.user_id, userId)).innerJoin(feeds, eq(feed_follows.feed_id, feeds.id));
    return result;
}