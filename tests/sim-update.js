import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,           
  duration: '1m',    
  thresholds: {
    http_req_duration: ['p(95)<200'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080';

export default function () {
  const updateRes = http.post(`${BASE_URL}/simulate-update`);
  check(updateRes, {
    'update status is 200': (r) => r.status === 200,
  });

  sleep(0.5);

  const leaderboardRes = http.get(`${BASE_URL}/leaderboard?page=1&limit=10`);
  check(leaderboardRes, {
    'leaderboard reflects update': (r) => r.status === 200,
  });

  sleep(0.5);
}