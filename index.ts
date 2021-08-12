export interface ContentfulUmzugOptions {
    spaceId: string;
    environmentId: string;
}

export class ContentfulStorage {
    doSomething({ spaceId, environmentId = 'master' } : ContentfulUmzugOptions) {
        console.log('something');
    }
}
