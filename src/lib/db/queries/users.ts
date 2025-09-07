import {db} from "..";
import { users } from "../schema.js";
import {eq} from "drizzle-orm";

export type User = typeof users.$inferSelect;

export async function createUser(name: string){
    const [result] = await db.insert(users).values({name:name}).returning();
    return result;
}

export async function getUser(withName: string){
    try {
        const [result] = await db.select().from(users).where(eq(users.name, withName));
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteAllUsers(){
    try {
        const [result] = await db.delete(users).returning();
        return result
    } catch (error){
        throw error;
    }
}

export async function getUsers(){
    try{
        const result = await db.select().from(users);
        return result;
    }
    catch(err){
        throw err;
    }
}