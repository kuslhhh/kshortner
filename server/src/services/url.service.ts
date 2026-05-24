import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { encodeIdToShortCode } from "../utils/shortCode.js";

export interface CreateLinkInput {
  originalUrl: string;
  shortCode?: string;
}

export interface LinkResponse {
  id: number;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: Date;
}

/**
 * createLink
 *
 * 1. Insert a row with only `originalUrl`.
 *    
 * 2. Read back the generated auto-increment `id`.
 * 3. Encode the `id` into a deterministic shortcode.
 * 4. Update the row with the real shortcode.
 * 5. Return the full link record.
 */
export async function createLink(input: CreateLinkInput): Promise<LinkResponse> {
  if (input.shortCode) {
    try {
      const created = await prisma.link.create({
        data: {
          originalUrl: input.originalUrl,
          shortCode: input.shortCode,
        },
        select: {
          id: true,
          originalUrl: true,
          shortCode: true,
          clicks: true,
          createdAt: true,
        },
      });

      return created;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new Error("SHORT_CODE_TAKEN");
      }

      throw err;
    }
  }

  // Step 1 – insert row with a temporary shortCode placeholder
  const created = await prisma.link.create({
    data: {
      originalUrl: input.originalUrl,
      shortCode: "__pending__",
    },
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      clicks: true,
      createdAt: true,
    },
  });

  // Step 2 & 3 – encode the numeric id into a shortcode
  const shortCode = encodeIdToShortCode(created.id);

  // Step 4 – persist the real shortcode back to the row
  const updated = await prisma.link.update({
    where: { id: created.id },
    data: { shortCode },
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      clicks: true,
      createdAt: true,
    },
  });

  return updated;
}

/**
 * findLinkByShortCode
 *
 * Looks up a link by its shortcode and atomically increments the click counter.
 * Returns null when no link is found.
 */
export async function findLinkByShortCode(
  shortCode: string,
): Promise<LinkResponse | null> {
  try {
    const link = await prisma.link.update({
      where: { shortCode },
      data: {
        clicks: { increment: 1 },
      },
      select: {
        id: true,
        originalUrl: true,
        shortCode: true,
        clicks: true,
        createdAt: true,
      },
    });

    return link;
  } catch {
    // Prisma throws a RecordNotFound error when the where clause matches nothing
    return null;
  }
}
