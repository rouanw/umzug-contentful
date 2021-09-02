import { ContentType, Entry, Environment } from "contentful-management/types";

const MIGRATION_CONTENT_TYPE = "Umzug Migration";

export async function getContentType(environment: Environment): Promise<ContentType> {
  const contentTypes = await environment.getContentTypes({
    name: MIGRATION_CONTENT_TYPE,
  });
  if (contentTypes.items.length === 1) {
    return contentTypes.items[0];
  }
  const contentType = await environment.createContentType({
    name: MIGRATION_CONTENT_TYPE,
    displayField: "title",
    fields: [
      {
        id: "title",
        name: "Title",
        required: true,
        localized: false,
        type: "Symbol",
      },
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

export async function getEntry(environment: Environment, locale = "en-US"): Promise<Entry> {
  const contentType = await getContentType(environment);
  const contentTypeId = contentType.sys.id;
  const entries = await environment.getEntries({ content_type: contentTypeId });
  if (entries.items.length === 1) {
    return entries.items[0];
  }
  const entry = await environment.createEntry(contentTypeId, {
    fields: {
      title: { [locale]: "Programmatic Migration Data" },
      migrationData: { [locale]: [] },
    },
  });
  await entry.publish();
  return entry;
}
