const https = require('https');

const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

exports.handler = async function (event) {
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
          return SUCCESS(CONFIG);
        case 'source':
          return NOT_IMPLEMENTED;
      }
      return INVALID_REQUEST;
    case 'POST':
      const request_body = (() => {
        switch (event.headers['content-type'].split(';')[0].trim()) {
          case 'application/json':
            return json_parse_or_null(event.body);
          case 'application/x-www-form-urlencoded':
            return Object.fromEntries((new URLSearchParams(event.body)).entries());
        }
        return null;
      })();

      if (!request_body)
        return INVALID_REQUEST;

      const action = request_body['action'] || 'create';
      // if (!authTokenScope(auth_token).includes(action))
      //   return INSUFFICIENT_SCOPE;
      const normalized_body = normalize_body(event.headers['content-type'], request_body);
      switch (action) {
        case 'create':
          return handleCreate(normalized_body);
        case 'update':
          return handleUpdate(normalized_body);
        case 'delete':
          return handleDelete(normalized_body);
        case 'undelete':
          return handleUndelete(normalized_body);
      }
      return INVALID_REQUEST;
  }

  return INVALID_REQUEST;
};

/// Validate the token and return its authorization scope. Returns an empty
/// array if not authorized
async function validateToken(token) {
  try {
    const response = await get({
      hostname: 'tokens.indieauth.com',
      path: '/token',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
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
const INVALID_REQUEST = error(400, "invalid_request");
const FAILED_JSON_PARSING = error(400, "invalid_request", "Could not parse JSON body");
const NOT_IMPLEMENTED = error(501, "not_implemented");

// ********************** BACKEND ****************************************************************************
// Functions to perform the actual changes to the website

async function handleCreate(body) {
  console.log(`CREATE ${JSON.stringify(body)}`);

  const content = body.properties.content;
  if (!content)
    return INVALID_REQUEST;

  let slug = new Date().getTime().toString();
  if (body.properties.title) {
    const safeTitle = body.properties.title.toLowerCase().replace(' ', '-');
    slug += `-${safeTitle}`;
  }

  const directory = 'contents/notes';
  const filename = `${slug}.md`;
  const path = `${directory}/${filename}`;

  await githubCreateFile(path, content);

  return success(undefined, { 'Location': `notes/${slug}` });
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
  console.log(`GITHUB CREATE AT ${path}:\n---\n\t${content.replace('\n', '\n\t')}\n---`)
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
  return new Promise((resolve, reject) => {
    const request = https.request({
      port: 443,
      ...options,
    }, res => {
      res.on('data', resolve)
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
  return request({ ...options, method: 'GET' }, body)
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
