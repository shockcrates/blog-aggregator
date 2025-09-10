import {db} from "..";
import {feed_follows, feeds, users, posts} from "../schema.js";
import {and, asc, eq, sql} from "drizzle-orm";
import { firstOrUndefined } from "./utils"

export type Posts = typeof posts.$inferSelect;

export async function createPost(postUrl: string, postTitle:string, postDescription: string, postPublishedAt:Date, postFeedId:string){
    const result = await db.insert(posts).values({
        url:postUrl,
        title:postTitle,
        description: postDescription,
        publishedAt:postPublishedAt,
        feed_id:postFeedId,
    }).returning();
    return firstOrUndefined(result)
}

export async function getPostsForUser(user_id: string, numOfPosts = 10){
    const result = await db.select({name: posts.title, url: posts.url, description: posts.description})
        .from(posts)
        .where(eq(posts.feed_id, feed_follows.feed_id))
        .innerJoin(feed_follows, eq(feed_follows.user_id, user_id))
        .orderBy(posts.publishedAt)
        .limit(numOfPosts)
    return result;
}