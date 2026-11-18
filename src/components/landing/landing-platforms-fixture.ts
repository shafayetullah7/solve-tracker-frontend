import type { PlatformListResponse } from "../../lib/api/modules/platforms.api";

/** Full catalog-shaped list for landing tests (16 judges). */
export const landingPlatformListFixture: PlatformListResponse = {
  items: [
    {
      slug: "codeforces",
      name: "Codeforces",
      baseUrl: "https://codeforces.com",
      urlHosts: ["codeforces.com"],
    },
    {
      slug: "leetcode",
      name: "LeetCode",
      baseUrl: "https://leetcode.com",
      urlHosts: ["leetcode.com"],
    },
    {
      slug: "codechef",
      name: "CodeChef",
      baseUrl: "https://www.codechef.com",
      urlHosts: ["codechef.com", "www.codechef.com"],
    },
    {
      slug: "atcoder",
      name: "AtCoder",
      baseUrl: "https://atcoder.jp",
      urlHosts: ["atcoder.jp"],
    },
    {
      slug: "hackerrank",
      name: "HackerRank",
      baseUrl: "https://www.hackerrank.com",
      urlHosts: ["hackerrank.com", "www.hackerrank.com"],
    },
    {
      slug: "geeksforgeeks",
      name: "GeeksforGeeks",
      baseUrl: "https://www.geeksforgeeks.org",
      urlHosts: ["geeksforgeeks.org", "www.geeksforgeeks.org"],
    },
    {
      slug: "kattis",
      name: "Kattis",
      baseUrl: "https://open.kattis.com",
      urlHosts: ["kattis.com", "open.kattis.com"],
    },
    {
      slug: "spoj",
      name: "SPOJ",
      baseUrl: "https://www.spoj.com",
      urlHosts: ["spoj.com", "www.spoj.com"],
    },
    {
      slug: "cses",
      name: "CSES",
      baseUrl: "https://cses.fi",
      urlHosts: ["cses.fi"],
    },
    {
      slug: "beecrowd",
      name: "beecrowd",
      baseUrl: "https://www.beecrowd.com.br",
      urlHosts: ["beecrowd.com.br", "www.beecrowd.com.br"],
    },
    {
      slug: "codewars",
      name: "Codewars",
      baseUrl: "https://www.codewars.com",
      urlHosts: ["codewars.com", "www.codewars.com"],
    },
    {
      slug: "hackerearth",
      name: "HackerEarth",
      baseUrl: "https://www.hackerearth.com",
      urlHosts: ["hackerearth.com", "www.hackerearth.com"],
    },
    {
      slug: "topcoder",
      name: "Topcoder",
      baseUrl: "https://www.topcoder.com",
      urlHosts: ["topcoder.com", "www.topcoder.com"],
    },
    {
      slug: "projecteuler",
      name: "Project Euler",
      baseUrl: "https://projecteuler.net",
      urlHosts: ["projecteuler.net"],
    },
    {
      slug: "uva",
      name: "UVa Online Judge",
      baseUrl: "https://onlinejudge.org",
      urlHosts: ["onlinejudge.org"],
    },
    {
      slug: "aizu",
      name: "Aizu Online Judge",
      baseUrl: "https://judge.u-aizu.ac.jp",
      urlHosts: ["judge.u-aizu.ac.jp"],
    },
  ],
};