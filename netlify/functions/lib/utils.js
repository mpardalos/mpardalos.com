import * as cheerio from 'cheerio';

export async function titleOfUrl(url) {
  const response = await fetch(url);
  const body = await response.text();
  const html = cheerio.load(body);
  const titleText = html('title').text();
  if (titleText.trim() == '') {
    return url
  } else {
    return titleText;
  }
}
