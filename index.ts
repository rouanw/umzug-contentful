import {createClient} from 'contentful-management';
import {Entry} from "contentful-management/types";

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

    private async getMigrationStateEntry() : Promise<Entry> {
        const space = await this.client.getSpace(this.spaceId);
        const environment = await space.getEnvironment(this.environmentId);
        const contentTypes = await environment.getContentTypes({name: this.MIGRATION_CONTENT_TYPE});
        const contentType = contentTypes.items[0];
        const entries = await environment.getEntries({content_type: contentType.sys.id});
        return entries.items[0];
    }

    private async getMigrationState() : Promise<string[]> {
        const entry = await this.getMigrationStateEntry();
        return entry.fields.migrationData['en-US'];
    }

    private async saveMigrationState(migrationState: string[]) {
        const migrationStateEntry : Entry = await this.getMigrationStateEntry();
        migrationStateEntry.fields.migrationData['en-US'] = migrationState;
        await migrationStateEntry.update();
    }

    async logMigration({ name: migrationName }: { name: string }) : Promise<void> {
        const migrationState = await this.getMigrationState();
        const newMigrationState = [...migrationState, migrationName];
        await this.saveMigrationState(newMigrationState);
    }

    async unlogMigration({ name: migrationName }: {name: string}) : Promise<void> {
        const migrationState = await this.getMigrationState();
        const updatedMigrations = migrationState.filter(name => name !== migrationName);
        await this.saveMigrationState(updatedMigrations);
    }

    async executed() : Promise<string[]> {
        return this.getMigrationState();
    }
}
