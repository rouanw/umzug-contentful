import { createClient } from "contentful-management";
import { Environment } from "contentful-management/types";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.CONTENTFUL_MANAGEMENT_TOKEN || !process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_ENVIRONMENT_ID) {
  throw new Error('Required environment variables are missing. Make sure you have a .env file with CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_SPACE_ID, and CONTENTFUL_ENVIRONMENT_ID');
}

const env = {
  contentfulManagementToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN as string,
  spaceId: process.env.CONTENTFUL_SPACE_ID as string,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID as string
};
import { getContentType, getEntry } from "../lib/contentful";

export async function getEnvironment(): Promise<Environment> {
  const client = createClient({
    accessToken: env.contentfulManagementToken,
  });
  const space = await client.getSpace(env.spaceId);
  return space.getEnvironment(env.environmentId);
}

export async function deleteEntry(environment: Environment): Promise<void> {
  const entry = await getEntry(environment);
  if (entry.isPublished()) {
    await entry.unpublish();
  }
  await environment.deleteEntry(entry.sys.id);
}

export async function deleteContentType(environment: Environment): Promise<void> {
  const contentType = await getContentType(environment);
  const entries = await environment.getEntries({ content_type: contentType.sys.id });
  for (const entry of entries.items) {
    if (entry.isPublished()) {
      await entry.unpublish();
    }
    await entry.delete();
  }
  if (contentType.isPublished()) {
    await contentType.unpublish();
  }
  await contentType.delete();
}
