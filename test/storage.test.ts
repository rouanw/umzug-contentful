import { Environment } from "contentful-management/types";
import { ContentfulStorage } from "../index";
import { getEntry, getContentType } from "../lib/contentful";
import { deleteContentType, deleteEntry, getEnvironment } from "./environment";
import env from "../.env.json";

describe("ContentfulStorage", () => {
  let environment: Environment;

  beforeEach(async () => {
    environment = await getEnvironment();
  });

  const getMigrationDataFromStorage = async () => {
    const entry = await getEntry(environment);
    return entry.fields.migrationData["en-US"];
  };

  const initContentfulEntry = async (content: string[] = []) => {
    const entry = await getEntry(environment);
    entry.fields.migrationData["en-US"] = content;
    await entry.update();
  };

  describe("logMigration", () => {
    const storage = new ContentfulStorage(env);

    test("adds a migration entry", async () => {
      await initContentfulEntry();
      await storage.logMigration({ name: "m1.txt" });
      expect(await getMigrationDataFromStorage()).toEqual(["m1.txt"]);
    });
    test("adds more than one migration entry", async () => {
      await initContentfulEntry(["00.txt"]);
      await storage.logMigration({ name: "m1.txt" });
      expect(await getMigrationDataFromStorage()).toEqual(["00.txt", "m1.txt"]);
    });
    test(`doesn't dedupe`, async () => {
      await initContentfulEntry();
      await storage.logMigration({ name: "m1.txt" });
      await storage.logMigration({ name: "m1.txt" });
      expect(await getMigrationDataFromStorage()).toEqual(["m1.txt", "m1.txt"]);
    });
    test("copes when there is no contentful entry for logged migrations", async () => {
      const entry = await getEntry(environment);
      await entry.unpublish();
      await entry.delete();
      await storage.logMigration({ name: "m1.txt" });
      expect(await getMigrationDataFromStorage()).toEqual(["m1.txt"]);
    });
    test("copes when there is no contentful content type for logged migrations", async () => {
      const entry = await getEntry(environment);
      await entry.unpublish();
      await entry.delete();
      const contentType = await getContentType(environment);
      await contentType.unpublish();
      await contentType.delete();
      await storage.logMigration({ name: "m1.txt" });
      expect(await getMigrationDataFromStorage()).toEqual(["m1.txt"]);
    });
    test("gives the entry a useful title", async () => {
      await deleteContentType(environment);
      await storage.logMigration({ name: "m1.txt" });
      const entry = await getEntry(environment);
      expect(entry.fields.title).toBeDefined();
      expect(entry.fields.title["en-US"]).toEqual("Programmatic Migration Data");
    });
    test("sets the title as the display field of the content type", async () => {
      await deleteContentType(environment);
      await storage.logMigration({ name: "m1.txt" });
      const contentType = await getContentType(environment);
      expect(contentType.displayField).toEqual("title");
    });
  });

  describe("unlogMigration", () => {
    const storage = new ContentfulStorage(env);

    test("removes entry", async () => {
      await initContentfulEntry(["m1.txt"]);
      await storage.unlogMigration({ name: "m1.txt" });
      expect(await getMigrationDataFromStorage()).toEqual([]);
    });
    test("does nothing when unlogging non-existent migration", async () => {
      await initContentfulEntry(["m1.txt"]);
      await storage.unlogMigration({ name: "does-not-exist.txt" });
      expect(await getMigrationDataFromStorage()).toEqual(["m1.txt"]);
    });
  });

  describe("executed", () => {
    const storage = new ContentfulStorage(env);

    test("returns empty array when no migrations are logged", async () => {
      await initContentfulEntry([]);
      expect(await storage.executed()).toEqual([]);
    });
    test("returns logged migration", async () => {
      await initContentfulEntry();
      await storage.logMigration({ name: "m1.txt" });
      expect(await storage.executed()).toEqual(["m1.txt"]);
    });
  });

  describe("customisation", () => {
    test("the entry ID should be customisable", async () => {
      const storage = new ContentfulStorage({ ...env, migrationEntryId: "ada" });
      await deleteEntry(environment);
      await storage.logMigration({ name: "m1.txt" });
      const entry = await getEntry(environment);
      expect(entry.sys.id).toEqual("ada");
    });
    test("the content type ID should be customisable", async () => {
      const storage = new ContentfulStorage({ ...env, migrationContentTypeId: "ada" });
      await deleteContentType(environment);
      await storage.logMigration({ name: "m1.txt" });
      const contentType = await getContentType(environment, "ada");
      expect(contentType.sys.id).toEqual("ada");
    });
  });
});
