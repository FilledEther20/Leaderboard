
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   
    { duration: '5m', target: 100 },   
    { duration: '2m', target: 200 },   
    { duration: '5m', target: 200 },   
    { duration: '2m', target: 300 },   
    { duration: '5m', target: 300 },   
    { duration: '5m', target: 0 },     
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],    
    http_req_duration: ['p(99)<1500'], 
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/leaderboard?page=1&limit=50`],
    ['GET', `${BASE_URL}/search?q=john`],
  ]);

  responses.forEach((res, idx) => {
    check(res, {
      [`request ${idx} succeeded`]: (r) => r.status === 200,
    });
  });

  sleep(1);
}