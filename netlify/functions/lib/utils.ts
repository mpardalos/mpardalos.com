import * as cheerio from 'cheerio';

export async function titleOfUrl(url: string) : Promise<string> {
  const response = await fetch(url);
  const body = await response.text();
  const html = cheerio.load(body);
  const titleText = html('title:first').text();
  if (titleText.trim() == '') {
    return url
  } else {
    return titleText;
  }
}

export function dbg(obj: any) {
  return JSON.stringify(obj, undefined, 2);
}
