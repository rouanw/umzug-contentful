import { createClient } from "contentful-management";
import { Entry } from "contentful-management/types";
import { getEntry } from "./lib/contentful";

export interface UmzugContentfulOptions {
  spaceId: string;
  environmentId: string;
  contentfulManagementToken: string;
}

export class ContentfulStorage {
  private client;
  private readonly environmentId: string;
  private readonly spaceId: string;

  constructor({ spaceId, environmentId, contentfulManagementToken }: UmzugContentfulOptions) {
    this.client = createClient({
      space: spaceId,
      accessToken: contentfulManagementToken,
    });
    this.environmentId = environmentId;
    this.spaceId = spaceId;
  }

  private async getContentfulEntryWithLoggedMigrations(): Promise<Entry> {
    const space = await this.client.getSpace(this.spaceId);
    const environment = await space.getEnvironment(this.environmentId);
    return getEntry(environment);
  }

  private async updateLoggedMigrations(migrations: string[]) {
    const loggedMigrationsEntry: Entry = await this.getContentfulEntryWithLoggedMigrations();
    loggedMigrationsEntry.fields.migrationData["en-US"] = migrations;
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
    return entry.fields.migrationData["en-US"];
  }
}
