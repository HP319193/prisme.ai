import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 100 }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
    { duration: '10m', target: 100 }, // stay at 100 users for 10 minutes
    { duration: '5m', target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    'webhook run successfully': ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};
const {
  BASE_URL = 'https://api.eda.prisme.ai',
  WORKSPACE_ID = 'X_wCz0n',
  AUTOMATION = 'Automation',
  BODY = JSON.stringify({
    foo: 'too',
  }),
} = __ENV;

export default () => {
  const webhookRes = http.post(
    `${BASE_URL}/v2/workspaces/${WORKSPACE_ID}/webhooks/${AUTOMATION}`,
    BODY ? JSON.parse(BODY) : {}
  );

  check(webhookRes, {
    'webhook run successfully': (resp) => resp.status === 200,
    'is body present': (resp) => resp.json().hasOwnProperty('body'),
  });

  sleep(1);
};
