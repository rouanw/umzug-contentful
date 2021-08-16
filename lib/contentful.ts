import {ContentfulEnvironmentAPI} from "contentful-management/dist/typings/create-environment-api";
import {Entry} from "contentful-management/types";

export async function getEntry(environment: ContentfulEnvironmentAPI, contentTypeId: string): Promise<Entry> {
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
