import {createClient} from 'contentful-management';
import {Entry} from "contentful-management/types";
import {ContentfulEnvironmentAPI} from "contentful-management/dist/typings/create-environment-api";

export interface ContentfulUmzugOptions {
    spaceId: string;
    environmentId: string;
    contentfulManagementToken: string;
}

export class ContentfulStorage {
    private client;
    private readonly environmentId: string;
    private readonly spaceId: string;
    private MIGRATION_CONTENT_TYPE = 'Umzug Migration';

    constructor({ spaceId, environmentId, contentfulManagementToken }: ContentfulUmzugOptions) {
        this.client = createClient({
            space: spaceId,
            accessToken: contentfulManagementToken,
        });
        this.environmentId = environmentId;
        this.spaceId = spaceId;
    }

    private static async getEntry(environment: ContentfulEnvironmentAPI, contentTypeId: string): Promise<Entry> {
        const entries = await environment.getEntries({content_type: contentTypeId});
        if (entries.items.length === 1) {
            return entries.items[0];
        }
        const entry = await environment.createEntry(contentTypeId, {
            fields: {
                migrationData: {'en-US': []}
            }
        });
        await entry.publish();
        return entry;
    }

    private async getContentfulEntryWithLoggedMigrations() : Promise<Entry> {
        const space = await this.client.getSpace(this.spaceId);
        const environment = await space.getEnvironment(this.environmentId);
        const contentTypes = await environment.getContentTypes({name: this.MIGRATION_CONTENT_TYPE});
        const contentType = contentTypes.items[0];
        return ContentfulStorage.getEntry(environment, contentType.sys.id);
    }

    private async updateLoggedMigrations(migrations: string[]) {
        const loggedMigrationsEntry : Entry = await this.getContentfulEntryWithLoggedMigrations();
        loggedMigrationsEntry.fields.migrationData['en-US'] = migrations;
        await loggedMigrationsEntry.update();
    }

    async logMigration({ name: migrationName }: { name: string }) : Promise<void> {
        const loggedMigrations = await this.executed();
        const updatedMigrations = [...loggedMigrations, migrationName];
        await this.updateLoggedMigrations(updatedMigrations);
    }

    async unlogMigration({ name: migrationName }: {name: string}) : Promise<void> {
        const loggedMigrations = await this.executed();
        const updatedMigrations = loggedMigrations.filter(name => name !== migrationName);
        await this.updateLoggedMigrations(updatedMigrations);
    }

    async executed() : Promise<string[]> {
        const entry = await this.getContentfulEntryWithLoggedMigrations();
        return entry.fields.migrationData['en-US'];
    }
}
