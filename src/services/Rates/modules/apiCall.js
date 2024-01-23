import { C } from '../../../modules';

const { ENDPOINT, TIMEOUT } = C;

const GET = 'GET';
const POST_METHODS = ['POST', 'PUT'];
const HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

if (typeof global.self === 'undefined') global.self = global;

export const apiCall = async ({ endpoint = ENDPOINT, headers, method = GET, service, ...props }) => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), POST_METHODS.includes(method) ? TIMEOUT.POST : TIMEOUT.GET);

  return new Promise((resolve, reject) => {
    fetch(`${endpoint}/${service}`, {
      headers: { ...HEADERS, ...headers },
      method,
      signal: controller.signal,
      ...(POST_METHODS.includes(method) ? { body: JSON.stringify(props) } : props),
    })
      .then(async (response) => {
        const json = await response.json();

        if (response.status >= 400) reject({ code: response.status, message: json.message });
        else resolve(json);
      })
      .catch(({ message = 'Something wrong happened. Try again.', response } = {}) => {
        reject({
          code: response ? response.status : 500,
          message,
        });
      });
  });
};
