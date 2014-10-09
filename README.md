# Vector Image Widget

This widget uses SVG to render images.

This is intended primarily for icon images where they are needed in multiple sizes, styles, colours, and need to look sharp on all platforms.

Need an icon to be 40mm? What's the dpi on every device that exists and ever will exist?

Need an icon in five different colours? How large would your app be if you were to generate five separate images in all the different scaling factors? What if you need to make a simple change? Tell your designers to spin up 25 new assets for you!

### What about font icons?

Font icons have a few limitations. They cannot be positioned precisely, they can only be one colour, the cannot be styled, and they difficult to modify, and nearly impossible to change on the fly.

By using SVG images and an optional style sheet, this widget can use a single image, and a handful of stylesheets to create rich vector images, that look sharp on every platform, without having to generate dozens of copies of every image for every platform.

## Getting started

	git clone git@github.com:appcelerator-services/VectorImage.git

This git provides a sample app to explore that shows two different use cases. 

1. The first case is three different icons, all looking sharp. These are done with a single SVG image and three style sheets.
2. The second case is a complex SVG image that renders sharp on all platforms.

### To use the widget

	<Widget class="light" src="com.capnajax.vectorimage" 
		svg="svg/light.svg" style="svg/stop.css"/>

That's all there is to it. The two parameters `svg` and `style` are the locations of the files, or the `svg` and `css` code itself.

	Alloy.createWidget({
		src:"com.capnajax.vectorimage",
		svg:"svg/light.svg",
		css:"circle{stroke:#f60}"
	});

The image will scale to fit the space provided by the widget but will not change its aspect ratio.

## Known Issues

This widget has a cacheing feature, the rendered SVG is saved as a blob in the app's cache. Unfortunately this is not working at the moment, and there will be a fix coming soon.

The demonstration app uses rotation transforms which are not supported by an Android versions Jelly Bean or older.
