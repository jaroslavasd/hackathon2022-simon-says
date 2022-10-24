import { test } from "@playwright/test";

const Color = {
  RED: {code: '234, 32, 39', id: 'b1'},
  BLUE: {code: '6, 81, 221', id: 'b2'},
  GREEN: {code: '0, 138, 132', id: 'b3'},
  YELLOW: {code: '254, 184, 20', id: 'b4'},
  LIGHT_BROWN: {code: '206, 211, 173', id: 'b5'},
  PINK: {code: '232, 67, 147'},
  WHITE: {code: 'white'},
};

test("Play The Game", async ({ page }) => {
	await page.goto("http://www.flashbynight.com/drench2/");
	await page.waitForSelector(`#butang1`)
	await page.click(`#butang1`);

	// for(let i = 0; i < 5; i++) {
	// 	await clickColorRandom(page)
	// 	await page.waitForTimeout(1000);
	// }

		for(let i = 0; i < 5; i++) {
			await clickElementByColor(await getMaxColor(page), page)
			await page.waitForTimeout(1000);
	}

	await new Promise(() => {});
});

const getKey = (color) => color && Object.keys(Color).find(key => Color[key] === color)?.toLowerCase()
const getColorByCode = (colorCode) => colorCode && Color[Object.keys(Color).find(color => Color[color].code === colorCode)!]
const getAllCubesOfColor = async (color, page) => await page.$$(`.square[style*="${color.code}"]`)
const getCellFromElement = (colorItem) => parseInt(colorItem.id.match(/\d+/)[0])
const clickElementByColor = async (color, page) => await color.id && page.click(`#${color.id}`)
const clickColorRandom = async (page) => await page.click(`#b${Math.floor(Math.random() * 5) + 1}`)
const getMaxColor = async (page) => {
  let allColors: any[] = [];

  for (const item of Object.values(Color)) {
    allColors.push({key: getKey(item), size: (await getAllCubesOfColor(item, page)).length})

  }

  const max = Math.max(...allColors.map(o => o.size))
  const colorMax = Object.keys(allColors).find(key => allColors[key].size === max)
  return Color[allColors[colorMax!].key.toUpperCase()]
}

const neighbours = async (cell, page) => {
  let top = cell <= 8 ? null : cell - 9
  let right = (cell+1)%9 ? cell + 1 : null
  let bottom = cell >= 72 ? null : cell + 9
  let left = cell > 0 && cell%9 ? cell - 1 : null

  let topColor = top && await (await page.waitForSelector(`#sq${top}`)).evaluate((el) => el.attributes.style.nodeValue.match(/rgb\((.*)\)/)[1]);
  let rightColor = right &&  await (await page.waitForSelector(`#sq${right}`)).evaluate((el) => el.attributes.style.nodeValue.match(/rgb\((.*)\)/)[1]);
  let bottomColor = bottom &&  await (await page.waitForSelector(`#sq${bottom}`)).evaluate((el) => el.attributes.style.nodeValue.match(/rgb\((.*)\)/)[1]);
  let leftColor = left &&  await (await page.waitForSelector(`#sq${left}`)).evaluate((el) => el.attributes.style.nodeValue.match(/rgb\((.*)\)/)[1]);

  const neighboursToReturn: any[] = [];
  top && neighboursToReturn.push({"position": "top", "color": getKey(getColorByCode(topColor)), "cell": top})
  right && neighboursToReturn.push({"position": "right", "color": getKey(getColorByCode(rightColor)), "cell": right})
  bottom && neighboursToReturn.push({"position": "bottom", "color": getKey(getColorByCode(bottomColor)), "cell": bottom})
  left && neighboursToReturn.push({"position": "left", "color": getKey(getColorByCode(leftColor)), "cell": left})

  return neighboursToReturn

  // return [
  //   {"position": "top", "color": getKey(getColorByCode(topColor)), "number": top},
  //   {"position": "right", "color": getKey(getColorByCode(rightColor)), "number": right},
  //   {"position": "bottom", "color": getKey(getColorByCode(bottomColor)), "number": bottom},
  //   {"position": "left", "color": getKey(getColorByCode(leftColor)), "number": left}
  // ]
}


