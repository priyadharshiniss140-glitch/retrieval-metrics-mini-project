# Retrieval Metrics Mini Project

This project evaluates the same 10 queries against two fixed ranking systems: keyword search and semantic search. Run it with plain Node.js—no database, API keys, or extra packages are required.

## Run

```bash
node eval.js
```

The program calculates reciprocal rank per query, Mean Reciprocal Rank (MRR) and Recall@10, then prints a Markdown comparison table.

## Results

```text
| Query | Keyword rank | Semantic rank |
|---|---|---|
| my redis cache keeps showing old data | 8 | 1 |
| how do I add semantic search to a table I already have | miss | 2 |
| redis or memcached for caching | 1 | 2 |
| why did my query get slower after I added an index | miss | 1 |
| what does ACID actually guarantee | 2 | 1 |
| how do I keep my postgres online while changing the schema | 6 | 3 |
| my background jobs stop after every deploy | miss | 2 |
| how do I let my database accept more writes per second | 4 | 1 |
| sql or nosql for a new product | 1 | 3 |
| why does my redis memory keep climbing | miss | 2 |
| **Summary** | **MRR 0.30 · Recall@10 0.60** | **MRR 0.67 · Recall@10 1.00** |
```

## Interpretation

Semantic search performs better overall on both metrics: its MRR is 0.67 compared with keyword search's 0.30, and its Recall@10 is 1.00 compared with 0.60. Keyword search wins on “redis or memcached for caching” and “sql or nosql for a new product,” where exact technology names and terminology align closely with the relevant post titles. Semantic search wins on the other eight queries, especially conversationally phrased questions and descriptions of symptoms or goals that do not necessarily repeat the wording in the post title. Those paraphrases benefit from matching meaning rather than requiring a literal term overlap. A team may still keep keyword search as part of a hybrid system because it can be especially precise for exact terms, product names, error strings, and other lexical matches.

## Metric definitions

- **Reciprocal Rank:** the inverse of the 1-based rank of the first relevant result; zero if no relevant item appears in the ranked list.
- **MRR:** mean of reciprocal ranks across all queries.
- **Recall@10:** fraction of queries with at least one correct post in the top 10.

## Input files

- `test-set.csv`: query and one or more correct post IDs (semicolon-separated).
- `search-results.json`: the top-10 rankings for keyword and semantic systems.
- `posts-dataset.csv`: source posts for sanity-checking the fixture.
