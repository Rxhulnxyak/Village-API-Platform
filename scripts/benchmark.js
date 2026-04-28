/**
 * API Performance Benchmark
 * WHY BENCHMARK: "Sub-100ms p95" is a claim we make to B2B clients.
 * This script verifies it using autocannon.
 */

const autocannon = require('autocannon');

const API_KEY = process.env.TEST_API_KEY || 'ak_demo0000000000000000000000000000';
const URL = process.env.API_URL || 'http://localhost:3000';

async function runScenario(name, path) {
  console.log(`\nRunning scenario: ${name}`);
  const instance = autocannon({
    url: URL + path,
    connections: 100, // 100 concurrent
    duration: 30, // 30 seconds
    headers: { 'X-API-Key': API_KEY }
  });

  autocannon.track(instance, { renderProgressBar: true });

  const result = await instance;
  
  console.log(`\nResults for ${name}:`);
  console.log(`p50: ${result.latency.p50}ms`);
  console.log(`p95: ${result.latency.p95}ms`);
  console.log(`p99: ${result.latency.p99}ms`);
  console.log(`Req/Sec: ${result.requests.average}`);
  console.log(`Errors: ${result.errors}`);
  
  if (result.latency.p95 < 100) {
    console.log(`✓ Fulfills SLA (p95 < 100ms)`);
  } else {
    console.log(`✗ FAILED SLA (p95 > 100ms)`);
  }
}

async function main() {
  await runScenario('Autocomplete (Cached)', '/v1/autocomplete?q=manib');
  await runScenario('Search (Trigram DB)', '/v1/search?q=xyzqwer');
  await runScenario('States List (Pure Cache)', '/v1/states');
}

main().catch(console.error);
