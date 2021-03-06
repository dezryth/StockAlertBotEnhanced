import cheerio from "cheerio";

export default function microcenter(html) {
	try {
		const TITLE_SELECTOR = "meta[property='og:title']";
		const IMAGE_SELECTOR = ".productImageZoom";

		const $ = cheerio.load(html);
		const title = $(TITLE_SELECTOR).attr("content")?.replace(" - Micro Center", "");
		const image = $(IMAGE_SELECTOR).attr("src");
		let inventory = undefined;
		if (html.includes("Outofstock")) {
			inventory = false;
		} else {
			inventory = true;
		}

		return { title, image, inventory };
	} catch (error) {
		return { error };
	}
}
