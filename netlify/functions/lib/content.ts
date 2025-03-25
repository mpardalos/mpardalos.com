// This module contains functions to perform the actual changes to the website

import * as github from "./github";
import { dbg, titleOfUrl } from "./utils";

type ShortPost = {
  content: string,
}

type Bookmark = {
  bookmarkOf: string,
  title?: string,
  content?: string
}

type Like = {
  likeOf: string,
  title?: string,
  content?: string
}

export async function createShortPost(shortPost: ShortPost) {
  console.log(`Short post ${dbg(shortPost)}`);
  const now = new Date();
  const slug = now.getTime().toString();
  const path = `content/social/${slug}.md`;

  let content = ""
  content += "---\n"
  content += `date: ${now.toISOString()}\n`
  content += "---\n"
  content += "\n"
  content += shortPost.content;

  await github.createFile(path, content)

  return `/social/${slug}`;
}

export async function createBookmark(bookmark: Bookmark) {
  console.log(`Bookmark ${dbg(bookmark)}`);
  const now = new Date();
  const slug = now.getTime().toString();
  const path = `content/links/${slug}.md`;

  let content = ""
  content += "---\n"
  content += `date: ${now.toISOString()}\n`
  content += `bookmark_of: "${bookmark.bookmarkOf}"\n`
  if (bookmark.title) {
    content += `title: ${bookmark.title}\n`
  } else {
    try {
      const title = await titleOfUrl(bookmark.bookmarkOf);
      content += `title: "${title}"\n`
    } catch (err) {
      console.log(`Error getting url of ${bookmark.bookmarkOf}: ${dbg(err)}`)
    }
  }
  content += "---\n"
  if (bookmark.content) {
    content += "\n"
    content += bookmark.content;
  }

  await github.createFile(path, content)

  return `/links/${slug}`;
}

export async function createLike(like: Like) {
  console.log(`Like ${dbg(like)}`);
  const now = new Date();
  const slug = now.getTime().toString();
  const path = `content/links/${slug}.md`;

  let content = ""
  content += "---\n"
  content += `date: ${now.toISOString()}\n`
  content += `like_of: "${like.likeOf}"\n`
  if (like.title) {
    content += `title: "${like.title}"\n`
  } else {
    try {
      const title = await titleOfUrl(like.likeOf);
      content += `title: "${title}"\n`
    } catch (err) {
      console.log(`Error getting url of ${like.likeOf}: ${dbg(err)}`)
    }
  }

  content += "---\n"
  if (like.content) {
    content += "\n"
    content += like.content;
  }

  await github.createFile(path, content)

  return `/links/${slug}`;
}
