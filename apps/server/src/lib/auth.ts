import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
// import { nextCookies } from 'better-auth/next-js';
import { db } from "../db";

import { jwt } from "better-auth/plugins";  // If you want JWT tokens

import { openAPI } from "better-auth/plugins"

import * as schema from "../db/schema/auth";
import {
  username,
  anonymous,
  organization,
  admin,
} from 'better-auth/plugins';
const betterAuthOptions: BetterAuthOptions = {
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	user: {
				additionalFields: {
					userType: {
						type: "string",
						required: true,
						input: true,
						},
						lastName: {
											type: "string",
											required: true,
											input: true,
											},
				},
	},
	trustedOrigins: [process.env.CORS_ORIGIN || "http://localhost:3001", "mybettertapp://", "exp://"],
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [
    admin(),
    anonymous(),
    openAPI(),
    username(),
    organization(),

    expo(),

    // nextCookies(),
  ],
};

export const auth: ReturnType<typeof betterAuth> = betterAuth(betterAuthOptions);
