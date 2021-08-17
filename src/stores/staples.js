import cheerio from "cheerio";

export default function staples(html) {
	try {
		const TITLE_SELECTOR = "meta[property='og:title']";
		const IMAGE_SELECTOR = ".image-gallery-ux2dot0__image_element";

		const $ = cheerio.load(html);
		const title = $(TITLE_SELECTOR).attr("content")?.replace(" | Staples", "");
		const image = $(IMAGE_SELECTOR).attr("srcset").replace("1x", "");
		let inventory = undefined;
		if (html.includes("out of stock")) {
			inventory = false;
		} else {
			inventory = true;
		}

		return { title, image, inventory };
	} catch (error) {
		return { error };
	}
}
