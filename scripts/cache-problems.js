// @ts-nocheck

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of this script file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import problem IDs from JSON file
const patternsPath = path.resolve(__dirname, '../src/data/patterns.json');
const patternsData = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));
const problems = Array.from(
  new Set(
    patternsData.patterns.reduce((acc, pattern) => {
      if (Array.isArray(pattern.problemIds)) {
        acc.push(...pattern.problemIds);
      }
      return acc;
    }, [])
  )
);

// Get problem IDs from the JSON data (exclude sandbox)
const PROBLEM_IDS = problems.filter(problem => problem.id !== 'sandbox');

const API_BASE_URL = 'https://alfa-leetcode-api.onrender.com/select?titleSlug=';
const CACHE_FILE = path.join(__dirname, '../src/data/problem-descriptions.json');

async function fetchProblemDescription(problemId, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Fetching ${problemId}... (attempt ${attempt}/${retries})`);
      const response = await fetch(`${API_BASE_URL}${problemId}`);
      
      // Timout
      if (response.status === 429) {
        const delayMs = Math.min(5000 * attempt, 30000); // Exponential backoff, max 30s
        console.log(`⏳ Rate limited, waiting ${delayMs/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${problemId}: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Successfully fetched ${problemId}`);
      
      // Add a longer delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return data;
    } catch (error) {
      if (attempt === retries) {
        console.error(`❌ Error fetching ${problemId} after ${retries} attempts:`, error.message);
        return null;
      }
      console.log(`⚠️  Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return null;
}

async function cacheAllProblems() {
  console.log('🚀 Starting to cache problem descriptions...\n');
  
  const cache = {};
  
  // Load existing cache if it exists
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const existingCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      Object.assign(cache, existingCache);
      console.log(`📁 Loaded existing cache with ${Object.keys(existingCache).length} problems\n`);
    } catch (error) {
      console.log('⚠️  Could not load existing cache, starting fresh\n');
    }
  }
  
  for (const problemId of PROBLEM_IDS) {
    // Skip if already cached
    if (cache[problemId]) {
      console.log(`⏭️  Skipping ${problemId} (already cached)`);
      continue;
    }
    
    const problemData = await fetchProblemDescription(problemId);
    if (problemData) {
      cache[problemId] = problemData;
    }
  }
  
  // Save cache to file
  try {
    const cacheDir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`\n💾 Cache saved to ${CACHE_FILE}`);
    console.log(`📊 Total problems cached: ${Object.keys(cache).length}`);
  } catch (error) {
    console.error('❌ Error saving cache:', error.message);
  }
}

// Run the script
cacheAllProblems().catch(console.error); 