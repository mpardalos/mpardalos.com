const https = require('https');

exports.handler = async function(event) {
  const auth_header = event.headers['authorization'];
  if (!auth_header)
    return UNAUTHORIZED;

  const auth_token = trimPrefix(auth_header, "Bearer ");
  if (!auth_token)
    return UNAUTHORIZED;

  if (!await validateToken(auth_token)) {
    return UNAUTHORIZED;
  }

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
        switch (event.headers['content-type']) {
          case 'application/json':
            return json_parse_or_null(event.body);
          case 'x-www-form-urlencoded':
            return event.queryStringParameters;
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

async function validateToken(token) {
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'tokens.indieauth.com',
      port: 443,
      path: '/token',
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      responseType: 'json'
    }, res => {
      res.on('data', (data) => {
        console.log(`Response: ${data}`);
        resolve(false);
      })
    });
    console.log(request);
    request.on('error', () => resolve(false))
    request.end();
  })
  // try {
  //   const { body } = await got(tokenEndpoint, {
  //     headers: {
  //       'accept': 'application/json',
  //       'Authorization': `Bearer ${token}`
  //     },
  //     responseType: 'json'
  //   })
  //   return body
  // } catch (err) {
  //   console.error(err)
  // }
}

function authTokenScope(token) {
  return ['create', 'update', 'delete'];
}

function normalize_body(contentType, body) {
  if (contentType == 'application/json')
    return body;

  let normalizedBody = { 'type': ['h-entry'], 'properties': {} };
  for (let [key, value] of Object.entries(body)) {
    if (key == 'h') {
      normalizedBody.type = [value]
    } else if (key.endsWith("[]")) {
      normalizedBody.properties['key'] = value.split(",");
    } else {
      normalizedBody.properties['key'] = value;
    }
  }
  return normalizedBody;
}

function handleCreate(body) {
  console.log(`CREATE ${JSON.stringify(body)}`);
  return NOT_IMPLEMENTED;
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
