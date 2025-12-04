# Photoserv Astro Loader

Allows you to seamlessly use Photoserv with your Astro site.

## Usage

`npm i @photoserv/astro-loader`

In your Astro `content.config.ts`:

```typescript
const photos = defineCollection({
	loader: photosLoader({
		apiUrl: import.meta.env.PHOTOSERV_API_URL,
		apiKey: import.meta.env.PHOTOSERV_API_KEY,
		sizes: ["display_md", "thumb_lg"], // sizes to fetch
	})
});

const albums = defineCollection({
	loader: albumsLoader({
		apiUrl: import.meta.env.PHOTOSERV_API_URL,
		apiKey: import.meta.env.PHOTOSERV_API_KEY,
	})
});

const photoTags = defineCollection({
	loader: tagsLoader({
		apiUrl: import.meta.env.PHOTOSERV_API_URL,
		apiKey: import.meta.env.PHOTOSERV_API_KEY,
	})
});
```

> [!IMPORTANT]
> Photos will be downloaded to `public/photoserv-cache`. You should add this to your gitignore.

Then, utilize the PhotoservPicture component:

```js
---
import PhotoservPicture from "@photoserv/astro-loader/components/PhotoservPicture.astro";
---

<PhotoservPicture
    photo="uuid"                    // required
    size="display_md"               // required
    alt="Alt text here"
    class="additional-class"
    draggable="false"               // additional props
    oncontextmenu="return false;"   // additional props
    title="photo title"             // additional props
    {...rest}                       // additional props
/>
```

It is recommended to wrap the provided component in your own, like so:

```js
---
import PhotoservPicture from "@photoserv/astro-loader/components/PhotoservPicture.astro";
import type { Photo } from "@photoserv/astro-loader/definitions";

export interface Props {
    photo: Photo;
    size?: string;
    [key: string]: any;
}

const { photo, size = PHOTOSERV_DISPLAY_SIZE, class: className = "max-h-[90vh]", ...rest } = Astro.props as Props;
const { height, width } = photo.sizes.find((_size) => _size.slug == size) || {};
if (height && width) {
    rest.height = height;
    rest.width = width;
}
---

<div class={`flex justify-center ${className}`}>
    <PhotoservPicture
        photo={photo}
        size={size}
        alt={rest.alt || photo.description || photo.title}
        class=`select-none object-contain ${className}`
        draggable="false"
        oncontextmenu="return false;"
        title={photo.title}
        {...rest}
    />
</div>
```

## Compatibility

| Photoserv Version | Loader Version (this) |
| --- | --- |
| 0.x.x | 0.x.x |
