import type { Album, AlbumSummary, Photo, PhotoSummary, Tag, TagSummary } from "./definitions.js";

export class PhotoservAPI {
    private apiUrl: string;
    private apiKey: string;

    constructor(apiUrl: string, apiKey: string) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }

    private async get<T = any>(path: string): Promise<T> {
        const url = `${this.apiUrl}${path}`;
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                Accept: "application/json",
            },
        });

        if (!res.ok) {
            const msg = await res.text().catch(() => "");
            throw new Error(`GET ${url} failed: ${res.status} ${res.statusText} ${msg}`);
        }

        return res.json() as Promise<T>;
    }

    public async getPhotoSummaries(): Promise<PhotoSummary[]> {
        return this.get("/photos?include_sizes=true");
    }

    public async getPhoto(uuid: string): Promise<Photo> {
        return this.get(`/photos/${uuid}`);
    }

    public async getPhotos(): Promise<Photo[]> {
        const list = await this.getPhotoSummaries();
        return Promise.all(list.map((p) => this.getPhoto(p.uuid)));
    }

    public async getPhotoImage(photo: Photo, size: string): Promise<Buffer> {
        const url = `${this.apiUrl}/photos/${photo.uuid}/sizes/${size}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${this.apiKey}` } });

        return Buffer.from(await res.arrayBuffer());
    }

    public async getAlbumSummaries(): Promise<AlbumSummary[]> {
        return this.get("/albums");
    }

    public async getAlbum(uuid: string, recursive: boolean = false): Promise<Album> {
        return this.get(`/albums/${uuid}/?include_sizes=true&recursive=${recursive ? "true" : "false"}`);
    }

    public async getAlbums(recursive: boolean = false, recursiveAlbums: string[] = []): Promise<Album[]> {
        const list = await this.getAlbumSummaries();
        return Promise.all(list.map((a) => {
            const shouldBeRecursive = recursive || recursiveAlbums.includes(a.uuid) || recursiveAlbums.includes(a.slug);
            return this.getAlbum(a.uuid, shouldBeRecursive);
        }));
    }

    public async getTagSummaries(): Promise<TagSummary[]> {
        return this.get("/tags");
    }

    public async getTag(uuid: string): Promise<Tag> {
        return this.get(`/tags/${uuid}/?include_sizes=true`);
    }

    public async getTags(): Promise<Tag[]> {
        const list = await this.getTagSummaries();
        return Promise.all(list.map((t) => this.getTag(t.uuid)));
    }
}
