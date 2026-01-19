import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },    
    { duration: '1m', target: 10 },
    { duration: '10s', target: 500 },   
    { duration: '3m', target: 500 },    
    { duration: '10s', target: 10 },    
    { duration: '3m', target: 10 },     
    { duration: '10s', target: 0 },
  ],
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080';

export default function () {
  const res = http.get(`${BASE_URL}/leaderboard?page=1&limit=20`);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(0.3);
}
