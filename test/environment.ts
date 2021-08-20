import { createClient } from "contentful-management";
import { Environment } from "contentful-management/types";
import env from "../.env.json";

export async function getEnvironment() : Promise<Environment> {
  const client = createClient({
    accessToken: env.contentfulManagementToken,
  });
  const space = await client.getSpace(env.spaceId);
  return space.getEnvironment(env.environmentId);
}
