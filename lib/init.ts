import {ContentfulEnvironmentAPI} from "contentful-management/dist/typings/create-environment-api";

import { createClient } from 'contentful-management';
import env from '../.env.json';
import {ContentType, Entry} from "contentful-management/types";

const MIGRATION_CONTENT_TYPE = 'Umzug Migration';

const getOrCreateMigrationContentType = async (environment: ContentfulEnvironmentAPI) => {
    let contentType;
    const contentTypes = await environment.getContentTypes({name: MIGRATION_CONTENT_TYPE});
    if (contentTypes.items.length > 1) {
        throw new Error("There is more than one content model for migrations. Please remove any duplicates in Contentful.");
    }
    if (contentTypes.items.length === 1) {
        contentType = contentTypes.items[0];
    } else {
        contentType = await environment.createContentType({
            name: MIGRATION_CONTENT_TYPE,
            fields: [{
                id: 'migrationData',
                name: 'Migration Data',
                required: true,
                localized: false,
                type: 'Object',
            }],
            description: 'Field to hold programmatic migration data. Do not edit.'
        });
        await contentType.publish();
    }
    return contentType;
}

async function getOrCreateMigrationEntry(environment: ContentfulEnvironmentAPI, contentType: ContentType) : Promise<Entry> {
    let entry;
    const entries = await environment.getEntries({ content_type: contentType.sys.id });
    if (entries.items.length > 1) {
        throw new Error("There seems to be more than one migration record. Please remove any duplicates in Contentful");
    }
    if (entries.items.length === 0) {
        entry = await environment.createEntry(contentType.sys.id, {
            fields: {
                migrationData: { 'en-US': [] }
            }
        });
        await entry.publish();
    } else {
        entry = entries.items[0];
    }
    if (!entry) {
        throw new Error("Could not locate migration data entry");
    }
    return entry;
}

async function getEnvironment() {
    const client = createClient({
        accessToken: env.contentfulManagementToken,
    });
    const space = await client.getSpace(env.spaceId);
    return space.getEnvironment(env.environmentId);
}

export async function getEntry() {
    const environment = await getEnvironment();
    const contentType = await getOrCreateMigrationContentType(environment);
    return getOrCreateMigrationEntry(environment, contentType);
}

export async function getContentType() {
    const environment = await getEnvironment();
    return getOrCreateMigrationContentType(environment);
}
