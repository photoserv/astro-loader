import { type Loader } from "astro/loaders";
import { AlbumSchema, PhotoSchema, TagSchema } from "./definitions.js";
import { PhotoservAPI } from "./api.js";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";


export function photosLoader(options: {
    apiUrl: string;
    apiKey: string;
    sizes: string[]; // Static user-defined sizes
}): Loader {
    return {
        name: 'photoserv-photos-loader',

        load: async ({ store, parseData, logger, generateDigest, config }) => {
            const { apiUrl, apiKey, sizes } = options;
            if (!apiUrl || !apiKey) throw new Error('Missing apiUrl or apiKey');
            if (!sizes || sizes.length === 0) throw new Error('Provide at least one size');

            const api = new PhotoservAPI(apiUrl, apiKey);

            logger.info(`Fetching photos from ${apiUrl}...`);
            const photos = await api.getPhotos();
            store.clear();

            const cacheDir = path.resolve('./public/photoserv-cache');
            await fs.mkdir(cacheDir, { recursive: true });

            for (const photo of photos) {
                const sizesData: Record<string, string> = {};
                for (const size of sizes) {
                    const filename = `${photo.uuid}-${size}.jpg`;

                    // Get MD5 of the existing file on disk (node fs)
                    const filePath = path.join(cacheDir, filename);
                    const md5 = await (async () => {
                        try {
                            const fileBuffer = await fs.readFile(filePath);
                            const hashSum = crypto.createHash('md5');
                            hashSum.update(fileBuffer);
                            return hashSum.digest('hex');
                        } catch {
                            return null;
                        }
                    })();

                    // If file exists and MD5 matches, skip download
                    if (photo.sizes.find(s => s.slug === size && s.md5 === md5)) {
                        continue;
                    }

                    const buffer = await api.getPhotoImage(photo, size);
                    await fs.writeFile(filePath, buffer);

                    sizesData[size] = filename;
                }

                (photo as any).sizeFiles = sizesData;

                const data = await parseData({ id: photo.uuid, data: photo });
                const digest = generateDigest(data);

                store.set({ id: photo.uuid, data, digest });
            }

            logger.info(`Loaded ${photos.length} photos.`);
        },

        schema: PhotoSchema,
    };
};


export function albumsLoader(options: { apiUrl: string, apiKey: string }): Loader {
    return {
        name: "photoserv-albums-loader",

        load: async ({ store, parseData, logger, generateDigest, config }) => {
            const { apiUrl, apiKey } = options;

            if (!apiUrl || !apiKey) {
                throw new Error(
                    "Missing `apiUrl` or `apiKey` in collection loaderParams for albumsLoader."
                );
            }

            const api = new PhotoservAPI(apiUrl, apiKey);

            logger.info(`Fetching albums from ${apiUrl}...`);

            try {
                const albums = await api.getAlbums();

                store.clear();

                for (const album of albums) {
                    const data = await parseData({
                        id: album.uuid,
                        data: album,
                    });

                    const digest = generateDigest(data);

                    store.set({
                        id: album.uuid,
                        data,
                        digest,
                    });
                }

                logger.info(`Loaded ${albums.length} album entries.`);
            } catch (error) {
                logger.error(`Failed to load albums: ${(error as Error).message}`);
            }
        },

        schema: AlbumSchema,
    };
}


export function tagsLoader(options: { apiUrl: string, apiKey: string }): Loader {
    return {
        name: "photoserv-tags-loader",

        load: async ({ store, parseData, logger, generateDigest, config }) => {
            const { apiUrl, apiKey } = options;

            if (!apiUrl || !apiKey) {
                throw new Error(
                    "Missing `apiUrl` or `apiKey` in collection loaderParams for tagsLoader."
                );
            }

            const api = new PhotoservAPI(apiUrl, apiKey);

            logger.info(`Fetching tags from ${apiUrl}...`);

            try {
                const tags = await api.getTags();

                store.clear();

                for (const tag of tags) {
                    const data = await parseData({
                        id: tag.uuid,
                        data: tag,
                    });

                    const digest = generateDigest(data);

                    store.set({
                        id: tag.uuid,
                        data,
                        digest,
                    });
                }

                logger.info(`Loaded ${tags.length} tag entries.`);
            } catch (error) {
                logger.error(`Failed to load tags: ${(error as Error).message}`);
            }
        },

        schema: TagSchema,
    };
}
