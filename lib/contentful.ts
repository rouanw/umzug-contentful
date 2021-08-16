import { ContentfulEnvironmentAPI } from "contentful-management/dist/typings/create-environment-api";
import { ContentType, Entry } from "contentful-management/types";

const MIGRATION_CONTENT_TYPE = "Umzug Migration";

export async function getContentType(environment: ContentfulEnvironmentAPI): Promise<ContentType> {
  const contentTypes = await environment.getContentTypes({
    name: MIGRATION_CONTENT_TYPE,
  });
  if (contentTypes.items.length === 1) {
    return contentTypes.items[0];
  }
  const contentType = await environment.createContentType({
    name: MIGRATION_CONTENT_TYPE,
    fields: [
      {
        id: "migrationData",
        name: "Migration Data",
        required: true,
        localized: false,
        type: "Object",
      },
    ],
    description: "Field to hold programmatic migration data. Do not edit.",
  });
  await contentType.publish();
  return contentType;
}

export async function getEntry(environment: ContentfulEnvironmentAPI): Promise<Entry> {
  const contentType = await getContentType(environment);
  const contentTypeId = contentType.sys.id;
  const entries = await environment.getEntries({ content_type: contentTypeId });
  if (entries.items.length === 1) {
    return entries.items[0];
  }
  const entry = await environment.createEntry(contentTypeId, {
    fields: {
      migrationData: { "en-US": [] },
    },
  });
  await entry.publish();
  return entry;
}
