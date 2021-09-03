import { createClient } from "contentful-management";
import { Environment } from "contentful-management/types";
import env from "../.env.json";
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
  await deleteEntry(environment);
  const contentType = await getContentType(environment);
  await contentType.unpublish();
  await contentType.delete();
}
