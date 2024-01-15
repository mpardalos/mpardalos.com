// This module contains functions to perform the actual changes to the website

import * as github from "./github";

type ShortPost = {
  content: string,
  title: string,
}

type Like = {
  likeOf: string,
  title?: string,
  content?: string
}

export async function handleCreate(args: Like | ShortPost) {
  console.log(`CREATE ${JSON.stringify(args)}`);

  const now = new Date();
  let slug = now.getTime().toString();
  if (args.title) {
    const safeTitle = args.title.toLowerCase().replace(' ', '-');
    slug += `-${safeTitle}`;
  }
  const directory = 'content/social';
  const filename = `${slug}.md`;
  const path = `${directory}/${filename}`;

  let content = ""
  content += "---\n"
  content += `date: ${now.toISOString()}\n`
  if ('likeOf' in args) {
    content += `like_of: ${args.likeOf}\n`
  }
  if (args.title) {
    content += `title: ${args.title}\n`
  }
  content += "---\n"
  if ('content' in args) {
    content += "\n"
    content += args.content;
  }

  await github.createFile(path, content)

  return `/social/${slug}`;

}
