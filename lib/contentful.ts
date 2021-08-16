import { ContentfulEnvironmentAPI } from "contentful-management/dist/typings/create-environment-api";
import { Entry } from "contentful-management/types";

const MIGRATION_CONTENT_TYPE = "Umzug Migration";

async function getContentTypeId(
  environment: ContentfulEnvironmentAPI
): Promise<string> {
  const contentTypes = await environment.getContentTypes({
    name: MIGRATION_CONTENT_TYPE
  });
  if (contentTypes.items.length === 1) {
    const contentType = contentTypes.items[0];
    return contentType.sys.id;
  }
  const contentType = await environment.createContentType({
    name: MIGRATION_CONTENT_TYPE,
    fields: [
      {
        id: "migrationData",
        name: "Migration Data",
        required: true,
        localized: false,
        type: "Object"
      }
    ],
    description: "Field to hold programmatic migration data. Do not edit."
  });
  await contentType.publish();
  return contentType.sys.id;
}

export async function getEntry(
  environment: ContentfulEnvironmentAPI
): Promise<Entry> {
  const contentTypeId = await getContentTypeId(environment);
  const entries = await environment.getEntries({ content_type: contentTypeId });
  if (entries.items.length === 1) {
    return entries.items[0];
  }
  const entry = await environment.createEntry(contentTypeId, {
    fields: {
      migrationData: { "en-US": [] }
    }
  });
  await entry.publish();
  return entry;
}
