import { ContentfulStorage } from '..';
import getEntry from "../lib/init";
import env from '../.env.json';

describe('ContentfulStorage', () => {
    const getMigrationDataFromStorage = async () => {
        const entry = await getEntry();
        return entry.fields.migrationData['en-US'];
    };

    const initContentfulEntry = async (content: string[] = []) => {
        const entry = await getEntry();
        entry.fields.migrationData['en-US'] = content;
        await entry.update();
    }

    describe('logMigration', () => {
        const storage = new ContentfulStorage(env);

        test('adds a migration entry', async () => {
            await initContentfulEntry();
            await storage.logMigration({ name: 'm1.txt' });
            expect(await getMigrationDataFromStorage()).toEqual(['m1.txt']);
        });
        test('adds more than one migration entry', async () => {
            await initContentfulEntry(['00.txt']);
            await storage.logMigration({ name: 'm1.txt' });
            expect(await getMigrationDataFromStorage()).toEqual(['00.txt', 'm1.txt']);
        });
        test(`doesn't dedupe`, async () => {
            await initContentfulEntry();
            await storage.logMigration({ name: 'm1.txt' });
            await storage.logMigration({ name: 'm1.txt' });
            expect(await getMigrationDataFromStorage()).toEqual(['m1.txt', 'm1.txt']);
        });
        test('copes when there is no contentful entry for logged migrations', async () => {
            const entry = await getEntry();
            await entry.unpublish();
            await entry.delete();
            await storage.logMigration({name: 'm1.txt'});
            expect(await getMigrationDataFromStorage()).toEqual(['m1.txt']);
        });
    });

    describe('unlogMigration', () => {
        const storage = new ContentfulStorage(env);

        test('removes entry', async () => {
            await initContentfulEntry(['m1.txt']);
            await storage.unlogMigration({ name: 'm1.txt' });
            expect(await getMigrationDataFromStorage()).toEqual([]);
        });
        test('does nothing when unlogging non-existent migration', async () => {
            await initContentfulEntry(['m1.txt']);
            await storage.unlogMigration({ name: 'does-not-exist.txt' });
            expect(await getMigrationDataFromStorage()).toEqual(['m1.txt']);
        });
    });

    describe('executed', () => {
        const storage = new ContentfulStorage(env);

        test('returns empty array when no migrations are logged', async () => {
            await initContentfulEntry([]);
            expect(await storage.executed()).toEqual([]);
        });
        test('returns logged migration', async () => {
            await initContentfulEntry();
            await storage.logMigration({ name: 'm1.txt' });
            expect(await storage.executed()).toEqual(['m1.txt']);
        });
    });
});
