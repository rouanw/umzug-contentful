import { ContentType, Entry, Environment } from "contentful-management/types";

const MIGRATION_CONTENT_TYPE = "Umzug Migration";

interface GetEntryOptions {
  locale?: string;
  migrationEntryId?: string;
  migrationContentTypeId?: string;
}

const defaultGetEntryOptions = {
  locale: "en-US",
  migrationEntryId: "umzugMigrationDataEntry",
  migrationContentTypeId: "umzugMigrationData",
};

export async function getContentType(
  environment: Environment,
  contentTypeId = defaultGetEntryOptions.migrationContentTypeId,
): Promise<ContentType> {
  let contentType;
  try {
    contentType = await environment.getContentType(contentTypeId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    contentType = await environment.createContentTypeWithId(contentTypeId, {
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
  }
  return contentType;
}

export async function getEntry(environment: Environment, options: GetEntryOptions = {}): Promise<Entry> {
  const { migrationEntryId, migrationContentTypeId, locale } = {
    ...defaultGetEntryOptions,
    ...options,
  };
  let entry;
  try {
    entry = await environment.getEntry(migrationEntryId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    await getContentType(environment, migrationContentTypeId);
    entry = await environment.createEntryWithId(migrationContentTypeId, migrationEntryId, {
      fields: {
        title: { [locale]: "Programmatic Migration Data" },
        migrationData: { [locale]: [] },
      },
    });
    await entry.publish();
  }
  return entry;
}
