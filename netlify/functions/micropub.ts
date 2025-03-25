import * as github from "./lib/github";
import * as Netlify from "@netlify/functions";
import * as content from "./lib/content";
import { dbg } from "./lib/utils";

type Content = string[];

type PostProperties = {
  title?: [string];
  content: Content;
};

type LikeProperties = {
  "like-of": [string];
  name?: [string];
};

type BookmarkProperties = {
  "bookmark-of": [string];
  name?: [string];
  content?: Content;
  category?: string[];
};

type CommonProperties = {
  "mp-slug"?: [string];
};

type Action = "create" | "update" | "delete" | "undelete";

type MicropubRequest = {
  type: [string];
  action: Action;
  properties: CommonProperties & (PostProperties | LikeProperties | BookmarkProperties);
};

type AuthorizationScope = Action[];

type RequestData = {
  headers: Headers;
  searchParams: URLSearchParams;
  body: FormData | object | string;
};

async function parseRequestData(req: Request): Promise<RequestData> {
  const contentType = req.headers.get("Content-Type")?.split(";");
  return {
    headers: req.headers,
    searchParams: new URL(req.url).searchParams,
    body: contentType?.includes("application/json")
      ? await req.json()
      : contentType?.includes("multipart/form-data") ||
          contentType?.includes("application/x-www-form-urlencoded")
        ? await req.formData()
        : await req.text(),
  };
}

async function checkAuthorization(
  req: RequestData,
): Promise<AuthorizationScope> {
  const headerToken = trimPrefix(
    req.headers.get("Authorization") || "",
    "Bearer ",
  );
  const bodyToken =
    req.body instanceof FormData
      ? req.body.get("access_token")?.toString()
      : null;
  const authToken = headerToken || bodyToken;
  if (!authToken) throw new Error("No auth token provided");

  const response: TokenVerificationResponse = await fetch(
    "https://tokens.indieauth.com/token",
    {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    },
  ).then((r) => r.json());

  if ("scope" in response && response.scope) {
    return response.scope.split(" ") as Action[];
  } else if ("error" in response) {
    throw new Error(`${response.error}: ${response.error_description}`);
  } else {
    throw new Error(`Unauthorized`);
  }
}

export default async (
  req: Request,
  context: Netlify.Context,
): Promise<Response | undefined> => {
  const reqData = await parseRequestData(req);
  console.log(reqData);
  const authorizationScope = await checkAuthorization(reqData);

  switch (req.method) {
    case "GET":
      const url = new URL(req.url);
      const q = url.searchParams.get("q");
      switch (q) {
        case "config":
        case "post-types":
          return new Response(
            JSON.stringify({
              "post-types": [
                {
                  name: "Short Post",
                  type: "note",
                },
                {
                  type: "bookmark",
                },
                {
                  type: "like",
                },
              ],
            }),
            {
              headers: {
                "content-type": "application/json",
              },
            },
          );
        case "source":
          NOT_IMPLEMENTED("source query");
        default:
          throw new Error(`Invalid q parameter: ${q}`);
      }
    case "POST":
      const micropub_request = await parseMicropubRequest(reqData);
      if (!authorizationScope.includes(micropub_request.action))
        throw new Error("Insufficient scope");
      return performRequest(micropub_request);
    default:
      throw new Error("Not a POST or GET request");
  }
};

async function performRequest(
  req: MicropubRequest,
): Promise<Response | undefined> {
  switch (req.action) {
    case "create":
      const location = await handleCreate(req);
      return new Response(
        JSON.stringify({
          created: location,
        }),
        {
          status: 201,
          headers: {
            location,
            "Content-Type": "application/json",
          },
        },
      );
    case "update":
      await handleUpdate(req);
    case "delete":
      await handleDelete(req);
    case "undelete":
      await handleUndelete(req);
    default:
      throw new Error(`Unknown action: ${req.action}`);
  }
}

async function parseMicropubRequest(
  req: RequestData,
): Promise<MicropubRequest> {
  let obj: MicropubRequest;
  if (req.body instanceof FormData) {
    obj = {
      action: "create",
      properties: {},
    } as any;
    for (const key of req.body.keys()) {
      if (key === "h") {
        const entryType = req.body.get("h");
        obj["type"] = [`h-${entryType}`];
      } else if (key.endsWith("[]")) {
        obj.properties[key.slice(0, key.length - 2)] = req.body.getAll(key);
      } else {
        obj.properties[key] = req.body.get(key);
      }
    }
  } else {
    obj = req.body as MicropubRequest;
  }

  if (obj.type[0] !== "h-entry") {
    throw new Error(`Unknown entry type '${obj.type[0]}'`);
  }

  obj.action ||= "create";

  if (!["create", "update", "delete", "undelete"].includes(obj.action)) {
    throw new Error(`Unknown action '${obj.action}'`);
  }

  return obj as MicropubRequest;
}

type TokenVerificationResponse =
  | {
      me: string;
      issued_by: string;
      issued_at: number;
      client_id: string;
      scope: string;
      nonce: number;
    }
  | {
      error: string;
      error_description: string;
    };

// ********************** BACKEND ****************************************************************************
// Functions to perform the actual changes to the website

/// create a post according to a micropub request. Returns the url for of the
/// created resource
async function handleCreate(req: MicropubRequest): Promise<string> {
  if (req.action !== "create") {
    throw "handleCreate called on a non-create request";
  }
  console.log(`CREATE ${dbg(req)}`);

  const props = req.properties;
  console.log(`props=${dbg(props)}`);
  if ("like-of" in props) {
    return content.createLike({
      likeOf: props["like-of"][0],
      content: props["content"]?.[0],
      title: props["title"]?.[0],
    });
  } else if ("bookmark-of" in props) {
    return content.createBookmark({
      bookmarkOf: props["bookmark-of"][0],
      content: props["content"]?.[0],
      title: props["title"]?.[0],
    });
  } else if (props.content) {
    return content.createShortPost({
      content: props.content[0],
    });
  }

  throw new Error("Unknown post type");
}

function handleUpdate(body) {
  console.log(`UPDATE ${dbg(body)}`);
  NOT_IMPLEMENTED("handleUpdate");
}

function handleDelete(body) {
  console.log(`DELETE ${dbg(body)}`);
  NOT_IMPLEMENTED("handleDelete");
}

function handleUndelete(body) {
  console.log(`UNDELETE ${dbg(body)}`);
  NOT_IMPLEMENTED("handleUndelete");
}

// *********************** HELPERS ****************************************************************************

function trimPrefix(str: string, prefix: string): string | null {
  if (str.startsWith(prefix)) return str.slice(prefix.length);
  else return null;
}

function json_parse_or_null(text) {
  try {
    return JSON.parse(text);
  } catch (SyntaxError) {
    return null;
  }
}

function fmtISODate(date) {
  return `${date.getYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

class NotImplementedError extends Error {
  constructor(msg: string) {
    super(`Not implemented: ${msg}`);
  }
}

function NOT_IMPLEMENTED(msg) {
  throw new NotImplementedError(msg);
}
