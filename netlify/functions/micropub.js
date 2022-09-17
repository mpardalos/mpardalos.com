const https = require('https');

const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const DO_NOT_CREATE = process.env.DO_NOT_CREATE; // Useful for debugging
const HOSTNAME = "https://mpardalos.xyz"

exports.handler = logged(async function(event) {
  const authHeader = event.headers['authorization'];
  if (!authHeader)
    return UNAUTHORIZED;

  const authToken = trimPrefix(authHeader, "Bearer ");
  if (!authToken)
    return UNAUTHORIZED;

  const authorizationScope = await validateToken(authToken);
  if (!authorizationScope)
    return UNAUTHORIZED;

  switch (event.httpMethod) {
    case 'GET':
      switch (event.queryStringParameters['q']) {
        case 'config':
          return success({});
        case 'source':
          return NOT_IMPLEMENTED;
      }
      return INVALID_REQUEST("Invalid q parameter");
    case 'POST':
      const request_body = (() => {
        switch (event.headers['content-type'].split(';')[0].trim()) {
          case 'application/json':
            return json_parse_or_null(event.body) || "Could not parse JSON body";
          case 'application/x-www-form-urlencoded':
            return Object.fromEntries((new URLSearchParams(event.body)).entries());
        }
        return `Unknown content-type: ${event.headers['content-type']}`;
      })();

      if (!request_body || typeof request_body !== 'object')
        return INVALID_REQUEST(request_body);

      const action = request_body['action'] || 'create';
      // if (!authTokenScope(auth_token).includes(action))
      //   return INSUFFICIENT_SCOPE;
      const normalized_body = normalize_body(event.headers['content-type'], request_body);
      switch (action) {
        case 'create':
          return await handleCreate(normalized_body);
        case 'update':
          return await handleUpdate(normalized_body);
        case 'delete':
          return await handleDelete(normalized_body);
        case 'undelete':
          return await handleUndelete(normalized_body);
      }
      return INVALID_REQUEST(`Unknown action: ${action}`);
  }

  return INVALID_REQUEST("Not a POST or GET request");
});

/// Validate the token and return its authorization scope. Returns an empty
/// array if not authorized
async function validateToken(token) {
  console.log(`Validate token: ${token}`);
  try {
    const response_raw = await get({
      hostname: 'tokens.indieauth.com',
      path: '/token',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
    console.log(`Indieauth response: ${response_raw}`);
    const response = JSON.parse(response_raw);
    console.log(`Token scope: ${response.scope}`);
    return response.scope || [];
  } catch (err) {
    return [];
  }
}

function normalize_body(contentType, body) {
  if (contentType == 'application/json')
    return body;

  let normalizedBody = { 'type': ['h-entry'], 'properties': {} };
  for (let [key, value] of Object.entries(body)) {
    key = key.trim();
    if (key == 'h') {
      normalizedBody.type = [value]
    } else if (key.endsWith("[]")) {
      normalizedBody.properties[key] = value.split(",");
    } else {
      normalizedBody.properties[key] = value;
    }
  }
  return normalizedBody;
}

const response = (statusCode, body, headers) => ({ statusCode, headers, body: JSON.stringify(body) })
const success = (body, headers) => response(200, body, headers);
const error = (statusCode, error, error_description) => response(statusCode, { error, error_description });

const UNAUTHORIZED = error(401, "unauthorized");
const FORBIDDEN = error(403, "forbidden");
const INSUFFICIENT_SCOPE = error(403, "insufficient_scope");
const INVALID_REQUEST = (reason) => error(400, "invalid_request", reason);
const FAILED_JSON_PARSING = error(400, "invalid_request", "Could not parse JSON body");
const NOT_IMPLEMENTED = error(501, "not_implemented");
const CREATED = (location) => response(201, undefined, { location })

// ********************** BACKEND ****************************************************************************
// Functions to perform the actual changes to the website

async function handleCreate(body) {
  console.log(`CREATE ${JSON.stringify(body)}`);
  if (!body.properties['content'] && !body.properties['like-of']) {
    return INVALID_REQUEST("No post content or like-of");
  }

  const now = new Date();
  let slug = now.getTime().toString();
  if (body.properties.title) {
    const safeTitle = body.properties.title.toLowerCase().replace(' ', '-');
    slug += `-${safeTitle}`;
  }
  const directory = 'content/feed';
  const filename = `${slug}.md`;
  const path = `${directory}/${filename}`;

  let content = ""
  content += "---\n"
  content += `date: ${now.toISOString()}`
  if (body.properties['like-of'])
    content += `like_of: ${body.properties['like-of']}`
  content += "---\n"
  if (body.properties['content']) {
    content += "\n"
    content += body.properties['content']
  }

  const github_response = await githubCreateFile(path, content)
  console.log(`GITHUB RESPONSE: ${github_response}`);

  return CREATED(`${HOSTNAME}/feed/slug`);

}

function handleUpdate(body) {
  console.log(`CREATE ${JSON.stringify(body)}`);
  return NOT_IMPLEMENTED;
}

function handleDelete(body) {
  console.log(`CREATE ${JSON.stringify(body)}`);
  return NOT_IMPLEMENTED;
}

function handleUndelete(body) {
  console.log(`CREATE ${JSON.stringify(body)}`);
  return NOT_IMPLEMENTED;
}

async function githubCreateFile(path, content) {
  console.log(`GITHUB CREATE AT ${path}:\n%%%%%%%\n${content}\n%%%%%%%`)
  if (DO_NOT_CREATE) {
    console.log("DO_NOT_CREATE")
    return {}
  }
  const base64_content = Buffer.from(content).toString('base64');
  return await put({
    hostname: 'api.github.com',
    path: `/repos/mpardalos/mpardalos.xyz/contents/${path}`,
    headers: {
      'User-Agent': 'node', // Github API requires a user-agent header
      'Accept': 'application/json',
      'Authorization': `Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}`
    },

  }, {
    "message": `Micropub: Create ${path}`,
    "content": base64_content
  })
}

// *********************** HELPERS ****************************************************************************

/// Perform an HTTP request. `options` as in https.request.
/// If `body` is an object or an array, it will be json-encoded
async function request(options, body) {
  console.log(`REQUEST ${options.method} ${options.hostname}${options.path}`);
  return new Promise((resolve, reject) => {
    const request = https.request({
      port: 443,
      ...options,
    }, res => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve(body.toString());
      });
    });
    request.on('error', reject)
    if (body) {
      if (typeof body === 'object') {
        request.write(JSON.stringify(body));
      } else {
        request.write(body);
      }
    }
    request.end();
  })
}

async function get(options) {
  return request({ ...options, method: 'GET' }, null)
}

async function put(options, body) {
  return request({ ...options, method: 'PUT' }, body)
}

function trimPrefix(str, prefix) {
  if (str.startsWith(prefix))
    return str.slice(prefix.length);
  else
    return null;
}

function json_parse_or_null(text) {
  try {
    return JSON.parse(text);
  } catch (SyntaxError) {
    return null;
  }
}

function logged(fn) {
  return async (...args) => {
    const res = await fn(...args);
    console.log("RESPONSE ", res);
    return res;
  }
}

function fmtISODate(date) {
  return `${date.getYear()}-${date.getMonth() + 1}-${date.getDate()}`
}
