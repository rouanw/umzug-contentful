import { ContentfulStorage } from '..';
import getEntry from "../lib/init";
import env from '../.env.json';

describe('ContentfulStorage', () => {
    const getMigrationDataFromStorage = async () => {
        const entry = await getEntry();
        return entry.fields.migrationData['en-US'];
    };

    describe('logMigration', () => {
        const initContentfulEntry = async (content: string[] = []) => {
            const entry = await getEntry();
            entry.fields.migrationData['en-US'] = content;
            await entry.update();
        }

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
        // test(`doesn't dedupe`, async () => {
        //     await storage.logMigration({ name: 'm1.txt' });
        //     await storage.logMigration({ name: 'm1.txt' });
        //
        //     expect(syncer.read()).toEqual({
        //         'umzug.json': json(['m1.txt', 'm1.txt']),
        //     });
        // });
    });
/*
    describe('unlogMigration', () => {
        const syncer = fsSyncer(path.join(__dirname, '../generated/JSONStorage/unlogMigration'), {
            'umzug.json': `["m1.txt"]`,
        });
        beforeEach(syncer.sync); // Wipes out the directory
        const storage = new JSONStorage({ path: path.join(syncer.baseDir, 'umzug.json') });

        test('removes entry', async () => {
            await storage.unlogMigration({ name: 'm1.txt' });
            expect(syncer.read()).toEqual({
                'umzug.json': '[]',
            });
        });

        test('does nothing when unlogging non-existent migration', async () => {
            await storage.unlogMigration({ name: 'does-not-exist.txt' });

            expect(syncer.read()).toEqual({
                'umzug.json': json(['m1.txt']),
            });
        });
    });

    describe('executed', () => {
        const syncer = fsSyncer(path.join(__dirname, '../generated/JSONStorage/executed'), {});
        beforeEach(syncer.sync); // Wipes out the directory

        const storage = new JSONStorage({ path: path.join(syncer.baseDir, 'umzug.json') });

        test('returns empty array when no migrations are logged', async () => {
            expect(await storage.executed()).toEqual([]);
        });

        test('returns logged migration', async () => {
            await storage.logMigration({ name: 'm1.txt' });
            expect(await storage.executed()).toEqual(['m1.txt']);
        });
    });
 */
});
