import { ContentfulEnvironmentAPI } from "contentful-management/dist/typings/create-environment-api";
import { createClient } from "contentful-management";
import env from "../.env.json";

export async function getEnvironment() : Promise<ContentfulEnvironmentAPI> {
  const client = createClient({
    accessToken: env.contentfulManagementToken,
  });
  const space = await client.getSpace(env.spaceId);
  return space.getEnvironment(env.environmentId);
}
