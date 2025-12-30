"use server";

import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { connectToDb } from "@/lib/db";
import { Link } from "@/models/Link";
import { generateCode } from "@/lib/utils";

const ShortenUrlSchema = z.object({
	url: z.string().url("Invalid URL"),
	customCode: z.string().min(3).max(24).optional()
});

export const shortenUrl = actionClient
	.schema(ShortenUrlSchema)
	.action(async ({ parsedInput: { url, customCode } }) => {
		await connectToDb();
		let code: string;

		if(customCode) {
			const exists = await Link.exists({ code: customCode });
			if(exists) throw new Error("This code is already taken.");
			code = customCode;
		} else {
			let attempts = 0;
			let isUnique = false;

			do {
				code = generateCode(8);
				const exists = await Link.exists({ code });
				if(!exists) isUnique = true;
				attempts++;
			} while(!isUnique && attempts < 5);

			if(!isUnique) throw new Error("Failed to generate a unique code. Please try again.");
		}

		const newLink = await Link.create({
			url: url,
			code: code
		});

		return { code: newLink.code };
	});