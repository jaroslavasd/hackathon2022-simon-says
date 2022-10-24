import { test } from "@playwright/test";

const gamePoints = 15;

test("Simon Says", async ({ page }) => {
	await page.goto("https://weslleyaraujo.github.io/react-simon-says/");
	await page.getByRole("link", { name: "Play" }).click();

	let observationTimeout = 1500;
	for (let i = 0; i < gamePoints; i++) {
		observationTimeout = observationTimeout + 450;
		const sequence = await observe(page, observationTimeout);
		await clickItems(page, sequence);
	}

	// just to keep window open
	await new Promise(() => {});
});

const observe = async (page, observationTimeout) => {
	return await page.evaluate(async (observationTimeout) => {
		const targetNode = document.querySelector("#root");
		const config = { attributes: true, subtree: true };

		const items: string[] = [];

		const func = (mutationList) => {
			for (const mutation of mutationList) {
				if (mutation.target.id) {
					items.push(mutation.target.id);
				}
			}
		};

		const observer = new MutationObserver(func);
		observer.observe(targetNode!, config);

		return await new Promise((resolve) => {
			setTimeout(() => {
				observer.disconnect();
				resolve(items);
			}, observationTimeout);
		});
	}, observationTimeout);
};

const clickItems = async (page, items) => {
	const odds = items.filter((value, index) => {
		return index % 2 !== 0;
	});

	console.log("Items to click: " + odds);
	for (let i = 0; i < odds.length; i++) {
		const selector = odds[i];
		console.log("Clicking:" + selector);
		await page.click(`#${selector}`);
		await page.evaluate(async () => {
			setTimeout(function () {}, 50);
		});
	}
};