import { betterAuth } from "better-auth";
import { db } from "./db";
 
export const auth = betterAuth({
    // This example uses local sqlite database
    database: db,
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        // You can add more providers here, check the documentation for more details
        // github: {
        //     clientId: "",
        //     clientSecret: ""
        // }
    }
})