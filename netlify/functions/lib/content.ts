// This module contains functions to perform the actual changes to the website

import * as github from "./github";

type ShortPost = {
  content: string,
  title: string,
}

type Bookmark = {
  bookmarkOf: string,
  title?: string,
  content?: string
}

export async function createShortPost(shortPost: ShortPost) {
  const now = new Date();
  const slug = now.getTime().toString();
  const path = `content/social/${slug}.md`;

  let content = ""
  content += "---\n"
  content += `date: ${now.toISOString()}\n`
  content += `title: ${shortPost.title}\n`
  content += "---\n"
  content += "\n"
  content += shortPost.content;

  await github.createFile(path, content)

  return `/social/${slug}`;
}

export async function createBookmark(bookmark: Bookmark) {
  const now = new Date();
  const slug = now.getTime().toString();
  const path = `content/bookmarks/${slug}.md`;

  let content = ""
  content += "---\n"
  content += `date: ${now.toISOString()}\n`
  content += `bookmark_of: ${bookmark.bookmarkOf}\n`
  if (bookmark.title) {
    content += `title: ${bookmark.title}\n`
  }
  content += "---\n"
  if (bookmark.content) {
    content += "\n"
    content += bookmark.content;
  }

  await github.createFile(path, content)

  return `/bookmarks/${slug}`;
}
