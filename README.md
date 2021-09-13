# Umzug Contentful

> [Umzug](https://www.npmjs.com/package/umzug) custom storage provider that stores migration data in [Contentful](https://www.contentful.com/).

Umzug is the migration tool that powers [sequelize](https://www.npmjs.com/package/sequelize). Umzug Contentful provides a Storage provider for umzug that allows your migration metadata to be stored in Contentful so that you can easily run stateful migrations on your Contentful data, probably using [contentful-migration](https://github.com/contentful/contentful-migration).

<img width="700" alt="image" src="https://user-images.githubusercontent.com/2362668/133118293-432dbe54-029d-4d4a-b743-765e57624d57.png">

## Installation

```shell
npm install -D umzug@beta umzug-contentful
```

Please note that this library was developed against `umzug` v3, which is currently in beta. v2 should work but this has not been tested.

## Usage

```typescript
import { Umzug } from "umzug";
import { ContentfulStorage } from "umzug-contentful";

const umzug = new Umzug({
  // ... other options
  storage: new ContentfulStorage({
    spaceId: "abc123",
    environmentId: "master",
    contentfulManagementToken: "my-secret-token",
  }),
});
```

Refer to the [umzug documentation](https://github.com/sequelize/umzug) for information on how to use umzug.

## Options

The `ContentfulStorage` constructor takes one parameter, of type `UmzugContentfulOptions`.

option                      | type      | required  | default       | description
---                         |---        |---        |---            |---
spaceId                     | string    | true      |               | Contentful Space ID
environmentId               | string    | true      |               | Contentful Environment ID (use `master` if you're not sure what this means)
contentfulManagementToken   | string    | true      |               | Access token for [Contentful's Management API](https://www.contentful.com/developers/docs/references/authentication/#the-content-management-api)
locale                      | string    | false     |`en-US`        | Locale to store data against, must be one you've configured
migrationEntryId            | string    | false     | `umzugMigrationDataEntry` | ID of the entry migration data will be stored in
migrationContentTypeId      | string    | false     | `umzugMigrationData` | ID of the content type migration data will be stored against

## Use with `contentful-migration`

You'll likely want to avoid boilerplate in your individual migration scripts. You can do this by passing a `runMigration` function to `contentful-migration` via the `umzug` context:

```typescript
import { Umzug } from "umzug";
import { ContentfulStorage } from "umzug-contentful";
import { runMigration, MigrationFunction } from "contentful-migration";
import * as fs from "fs";

async function migrate(migrationFunction: MigrationFunction): Promise<void> {
  await runMigration({
    migrationFunction,
    spaceId: "abc123",
    environmentId: "master",
    contentfulManagementToken: "my-secret-token",
  });
}

const umzug = new Umzug({
  // ... other options
  context: { migrate }, // do not pass a function as the context, because umzug will call it instead of passing it through
});

if (require.main === module) {
  void umzug.runAsCLI();
}
```

And then in your migration script:

```typescript
export const up = async ({ context }) => {
  await context.migrate((migration) => {
    // write your migration
  });
}
```

## License

MIT
