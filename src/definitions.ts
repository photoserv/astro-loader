import { z } from "astro:content";


export const PhotoSizeSchema = z.object({
    uuid: z.string(),
    slug: z.string(),
    height: z.number(),
    width: z.number(),
    md5: z.string(),
});

export type PhotoSize = z.infer<typeof PhotoSizeSchema>;

export const PhotoSummarySchema = z.object({
    uuid: z.string(),
    title: z.string(),
    slug: z.string(),
    publish_date: z.string().datetime({ offset: true }),
    sizes: z.array(PhotoSizeSchema),
});
export type PhotoSummary = z.infer<typeof PhotoSummarySchema>;

export const AlbumSummarySchema = z.object({
    uuid: z.string(),
    slug: z.string(),
    title: z.string(),
    short_description: z.string().optional().nullable(),
});
export type AlbumSummary = z.infer<typeof AlbumSummarySchema>;

export const TagSummarySchema = z.object({
    uuid: z.string(),
    name: z.string(),
});
export type TagSummary = z.infer<typeof TagSummarySchema>;

export const PhotoSchema = z.object({
    uuid: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    publish_date: z.string().datetime({ offset: true }),
    customAttributes: z.record(z.string(), z.string()).optional(),

    metadata: z.object({
        capture_date: z.string().datetime({ offset: true }).optional().nullable(),
        rating: z.number().optional().nullable(),
        camera_make: z.string().optional().nullable(),
        camera_model: z.string().optional().nullable(),
        lens_model: z.string().optional().nullable(),
        focal_length: z.number().optional().nullable(),
        focal_length_35mm: z.number().optional().nullable(),
        aperture: z.number().optional().nullable(),
        shutter_speed: z.number().optional().nullable(),
        iso: z.number().optional().nullable(),
        exposure_program: z.string().optional().nullable(),
        exposure_compensation: z.number().optional().nullable(),
        flash: z.string().optional().nullable(),
        copyright: z.string().optional().nullable(),
    }),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }).optional().nullable(),

    albums: z.array(AlbumSummarySchema),

    tags: z.array(TagSummarySchema),

    sizes: z.array(PhotoSizeSchema),
    sizeFiles: z.record(z.string(), z.string()).optional(),
});

export type Photo = z.infer<typeof PhotoSchema>;


export const AlbumSchema = z.object({
    uuid: z.string(),
    slug: z.string(),
    title: z.string(),
    short_description: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    sort_method: z.string(),
    sort_descending: z.boolean(),
    customAttributes: z.record(z.string(), z.string()).optional(),

    photos: z.array(PhotoSummarySchema),

    parent: AlbumSummarySchema.optional().nullable(),
    children: z.array(AlbumSummarySchema),
});

export type Album = z.infer<typeof AlbumSchema>;


export const TagSchema = z.object({
    uuid: z.string(),
    name: z.string(),
    photos: z.array(PhotoSummarySchema),
});
export type Tag = z.infer<typeof TagSchema>;