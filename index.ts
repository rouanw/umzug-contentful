import { createClient } from "contentful-management";
import { Entry } from "contentful-management/types";
import { getEntry } from "./lib/contentful";

export interface UmzugContentfulOptions {
  spaceId: string;
  environmentId: string;
  contentfulManagementToken: string;
  locale?: string;
  migrationEntryId?: string;
  migrationContentTypeId?: string;
}

export class ContentfulStorage {
  private client;
  private readonly environmentId: string;
  private readonly spaceId: string;
  private readonly locale: string;
  private readonly migrationEntryId: string;
  private migrationContentTypeId: string;

  constructor({
                spaceId,
                environmentId,
                contentfulManagementToken,
                locale = "en-US",
                migrationEntryId = "umzugMigrationDataEntry",
                migrationContentTypeId = "umzugMigrationData"
              }: UmzugContentfulOptions) {
    this.client = createClient({
      space: spaceId,
      accessToken: contentfulManagementToken
    });
    this.environmentId = environmentId;
    this.spaceId = spaceId;
    this.locale = locale;
    this.migrationEntryId = migrationEntryId;
    this.migrationContentTypeId = migrationContentTypeId;
  }

  private async getContentfulEntryWithLoggedMigrations(): Promise<Entry> {
    const space = await this.client.getSpace(this.spaceId);
    const environment = await space.getEnvironment(this.environmentId);
    return getEntry(environment, { locale: this.locale, migrationEntryId: this.migrationEntryId, migrationContentTypeId: this.migrationContentTypeId });
  }

  private async updateLoggedMigrations(migrations: string[]) {
    const loggedMigrationsEntry: Entry = await this.getContentfulEntryWithLoggedMigrations();
    loggedMigrationsEntry.fields.migrationData[this.locale] = migrations;
    await loggedMigrationsEntry.update();
  }

  async logMigration({ name: migrationName }: { name: string }): Promise<void> {
    const loggedMigrations = await this.executed();
    const updatedMigrations = [...loggedMigrations, migrationName];
    await this.updateLoggedMigrations(updatedMigrations);
  }

  async unlogMigration({ name: migrationName }: { name: string }): Promise<void> {
    const loggedMigrations = await this.executed();
    const updatedMigrations = loggedMigrations.filter((name) => name !== migrationName);
    await this.updateLoggedMigrations(updatedMigrations);
  }

  async executed(): Promise<string[]> {
    const entry = await this.getContentfulEntryWithLoggedMigrations();
    return entry.fields.migrationData[this.locale];
  }
}
