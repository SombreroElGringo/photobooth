# Photobooth

Photobooth is a wordpress plugin who allow the user to take picture of himself by respecting some overlay rules provided. Once the photo is taken, this photo will reuse as new overlay to help the user to position his face and keep some consitency between the photos.

## Install

### FTP or Local env
- Copy the folder `photobooth` in `./wp-content/plugins`
- Open your `Admin dashboard` and go to `Plugins > Installed Plugins`
- `Active` the plugin `photobooth`

### Upload the plugin
- Download the last version of the `zip` at https://github.com/SombreroElGringo/photobooth/tags
- Rename the zip as `photobooth.zip`
- Open your `Admin dashboard` and go to `Plugins > Add New`
- Click on the button `Upload Plugin` and select the file to upload `photobooth.zip`
- Go to `Plugins > Installed Plugins`
- `Active` the plugin `photobooth`

## How to use it?

You just need to create a new `page` and use the following `shortcode`:

```
[photobooth
  types="top, hairline, left, right"
  overlays="top.png, hairline.png, left.png, right.png"
]
```

If needed you can use `multiple times` the `shortcode` on your page.
A `unique id` is generated for each shortcode.

```
[photobooth
  types="top, hairline"
  overlays="top.png, hairline.png"
]

[photobooth
  types="left, right"
  overlays="left.png, right.png"
]
```

## Shortcode requierements

| Parameter | Description |
|---|---|
| types | Should be a array of unique `value`. They will be use to select the last photo uploaded in the database for this `types` |
| overlays | Should be a array of `paths` to some `images` to use as default `overlay`. The `size` of the `image` for the `overlay` must be `320 pixels 240 pixels height` |


## Where the image is uploaded?

Once the photo is taken, we will check if the table `{wp-prefix}photobooth` exist in the database else we will create one. Then we will insert the the following information in the table and upload the image on the server:
- `id` the unique id of the image
- `user_id` the id of the user
- `type` is the parameter passed in the shortcode and will be use to categorize the image and which overlay we need to use
- `filepath` is the file path of the image `/wp-content/uploads/photobooth/{user_id}/{type}/image.png`
- `filename` is the file name with the following format: `{user_id}_{type}_{date}.png` the date follow ISO 8601 order "YYYY-MM-DD H:M:S"
