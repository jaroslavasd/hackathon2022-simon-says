import { test } from "@playwright/test";

test("Play The Game - Simon Says", async ({ page }) => {
	const gamePoints = 10;

	await page.goto("https://weslleyaraujo.github.io/react-simon-says/");
	const playButtonSelector = '//a[contains(string(), "Play")]'
	await page.waitForSelector(playButtonSelector)
	await page.click(playButtonSelector);

	console.log('PLAYING...')
	const observationTimeout = 2000;
	for (let i = 0; i < gamePoints; i++) {
		const sequence = await observe(observationTimeout + i * 300, page);
		await clickItems(sequence, page);
	}

  console.log('END')

	// just to keep window open
	await new Promise(() => {});
});

const observe = async (observationTimeout, page) => {
	return await page.evaluate(async observationTimeout => {
		const targetNode = document.querySelector("#root");
		const config = { attributes: true, subtree: true };

		const items: string[] = [];
		const mutationFunc = mutationList => 
			mutationList.forEach(mutation => mutation.target.id ? items.push(mutation.target.id) : '')
		
		const observer = new MutationObserver(mutationFunc);
		
		observer.observe(targetNode!, config);

		return await new Promise((resolve) => {
			setTimeout(() => {
				observer.disconnect();
				resolve(items);
			}, observationTimeout);
		});
	}, observationTimeout);
};

const clickItems = async (items, page) => {
	const odds = items.filter((value, index) => index % 2 !== 0);

	console.log(`Items to click (${odds.length}): ${odds}`);
	for (let i = 0; i < odds.length; i++) {
		await page.click(`#${odds[i]}`);
		await page.waitForTimeout(100);
	}
};