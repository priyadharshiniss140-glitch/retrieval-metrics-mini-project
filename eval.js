// Evaluate keyword and semantic retrieval using MRR and Recall@10.
const fs = require('fs');

function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split(/\r?\n/).slice(1);
  return lines.map((line) => {
    const comma = line.indexOf(',');
    const query = line.slice(0, comma);
    const ids = line.slice(comma + 1);
    return { query, correctIds: ids.split(';').map(Number) };
  });
}

const testSet = loadTestSet('test-set.csv');
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// Return the reciprocal rank of the first relevant result (0 if none is found).
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

// Return a 1-based rank for the first relevant item, or null for a miss.
function rankOf(rankedIds, correctIds) {
  const correct = new Set(correctIds.map(Number));
  const index = rankedIds.slice(0, 10).findIndex((id) => correct.has(Number(id)));
  return index === -1 ? null : index + 1;
}

const systems = {
  keyword: { reciprocalRankSum: 0, hits: 0 },
  semantic: { reciprocalRankSum: 0, hits: 0 },
};
const queryRows = [];

for (const { query, correctIds } of testSet) {
  const queryResults = results[query];
  if (
    !queryResults ||
    !Array.isArray(queryResults.keyword) ||
    !Array.isArray(queryResults.semantic)
  ) {
    throw new Error(`Missing ranked results for query: ${query}`);
  }

  const keywordRank = rankOf(queryResults.keyword, correctIds);
  const semanticRank = rankOf(queryResults.semantic, correctIds);
  const keywordRR = reciprocalRank(queryResults.keyword, correctIds);
  const semanticRR = reciprocalRank(queryResults.semantic, correctIds);

  systems.keyword.reciprocalRankSum += keywordRR;
  systems.semantic.reciprocalRankSum += semanticRR;
  if (keywordRank !== null) systems.keyword.hits += 1;
  if (semanticRank !== null) systems.semantic.hits += 1;

  queryRows.push({ query, keywordRank, semanticRank });
}

const totalQueries = testSet.length;
const summary = {};
for (const [name, stats] of Object.entries(systems)) {
  summary[name] = {
    mrr: stats.reciprocalRankSum / totalQueries,
    recall: stats.hits / totalQueries,
  };
}

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');
for (const row of queryRows) {
  console.log(`| ${row.query} | ${row.keywordRank ?? 'miss'} | ${row.semanticRank ?? 'miss'} |`);
}
console.log(
  `| **Summary** | **MRR ${summary.keyword.mrr.toFixed(2)} · Recall@10 ${summary.keyword.recall.toFixed(2)}** | **MRR ${summary.semantic.mrr.toFixed(2)} · Recall@10 ${summary.semantic.recall.toFixed(2)}** |`,
);
