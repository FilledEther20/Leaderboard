
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const leaderboardDuration = new Trend('leaderboard_duration');
const searchDuration = new Trend('search_duration');

export const options = {
  stages: [
    { duration: '30s', target: 50 },  
    { duration: '1m', target: 50 },   
    { duration: '30s', target: 100 }, 
    { duration: '1m', target: 100 },  
    { duration: '30s', target: 0 },   
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.01'],           
    leaderboard_duration: ['p(95)<300'],
    search_duration: ['p(95)<400'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080';

const SEARCH_TERMS = ['john', 'jane', 'mike', 'sarah', 'alex', 'emma', 'chris', 'lisa'];

export default function () {
  const leaderboardStart = Date.now();
  const page = Math.floor(Math.random() * 100) + 1;
  const leaderboardRes = http.get(`${BASE_URL}/leaderboard?page=${page}&limit=20`);
  leaderboardDuration.add(Date.now() - leaderboardStart);
  
  const leaderboardCheck = check(leaderboardRes, {
    'leaderboard status is 200': (r) => r.status === 200,
    'leaderboard has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) && body.length > 0;
      } catch {
        return false;
      }
    },
    'leaderboard response time < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(!leaderboardCheck);

  sleep(0.5);

  const searchTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  const searchStart = Date.now();
  const searchRes = http.get(`${BASE_URL}/search?q=${searchTerm}`);
  searchDuration.add(Date.now() - searchStart);
  
  const searchCheck = check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search returns array': (r) => {
      try {
        return Array.isArray(JSON.parse(r.body));
      } catch {
        return false;
      }
    },
    'search response time < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(!searchCheck);

  sleep(0.5);
}