---
title: Leetcode Contest 81 Solution
date: 2018-04-21 22:55:27
tags: 
  - Leetcode
  - 总结
categories: 
  - 编程题
---

Link：[https://leetcode.com/contest/weekly-contest-81](https://leetcode.com/contest/weekly-contest-81)

感觉最近 Leetcode 是不是越来越水了啊...纯拼手速的话，比赛风向就歪了（捂脸，我猜可能是之前那一次冷门数学题导致官方矫枉过正..）。第 1、2 题都是常规题，我用 O(n) 和 O(nlogn) 解的，优化思路之后再想。第 3 题 Trie ，第 4 题 dp。

<!-- more -->

# 820. Short Encoding of Words

Given a list of words, we may encode it by writing a reference string S and a list of indexes A.

For example, if the list of words is ["time", "me", "bell"], we can write it as S = "time#bell#" and indexes = [0, 2, 5].

Then for each index, we will recover the word by reading from the reference string from that index until we reach a "#" character.

What is the length of the shortest reference string S possible that encodes the given words?

```
Example 2:
Input: words = ["time", "me", "bell"]
Output: 10
Explanation: S = "time#bell#" and indexes = [0, 2, 5].
```

**Notes:**

- `1 <= words.length <= 2000.`
- `1 <= words[i].length <= 7.`
- Each word has only lowercase letters.

## Trie（不纠结是前缀还是后缀..）

这道题的思路，如果一个 word 是另一个 word 的后缀，那么我们选择将其合并，输出无法合并字符串的长度和（字符串长度 + 1，考虑#）。这思路感觉很明显是 Trie 树吧。我一看到这题，就建了个后缀树，然后 dfs 遍历所有分支求分支长度和。时间复杂度 O(∑len(word))。

```java
// Time Complexity O(∑len(word))
class Solution {
    class Node{
        Map<Character, Node> map = new HashMap<>();
    }
    int ans = 0;
    public int minimumLengthEncoding(String[] words) {
        Node root = new Node();
        for (String word : words) {
            built(word.length()-1, word, root);
        }
        
        dfs(root, 0);
        return ans;
    }
    
    void dfs(Node root, int dep) {
        if (root.map.isEmpty()) {
            ans += dep + 1;
            return;
        }
        
        for (Map.Entry<Character, Node> entry : root.map.entrySet()) {
            Node child = entry.getValue();
            dfs(child, dep+1);
        }
    }
    
    void built(int i, String word, Node root) {
        if (i < 0) return;
        char c = word.charAt(i);
        if (!root.map.containsKey(c)) root.map.put(c, new Node());
        built(i-1, word, root.map.get(c));
    }
}
```
# 823. Binary Trees With Factors

Given an array of unique integers, each integer is strictly greater than 1.

We make a binary tree using these integers and each number may be used for any number of times.

Each non-leaf node's value should be equal to the product of the values of it's children.

How many binary trees can we make?  Return the answer **modulo 10 \** 9 + 7**.

```
Example 2:
Input: A = [2, 4, 5, 10]
Output: 7
Explanation: We can make these trees: [2], [4], [5], [10], [4, 2, 2], [10, 2, 5], [10, 5, 2].
```

**Note:**

1. `1 <= A.length <= 1000.`
2. `2 <= A[i] <= 10 ^ 9`.

## DP

感觉这道题也是个典型的 dp 题。枚举子树因子组合，不重复的子树因子组合都可以切分成一个子问题，状态转移方程为 `dp[i * j] = dp[i] * dp[j] + dp[i * j]`。

1. 先 sort 整个数组
2. 枚举 i 之前的所有数 j，如果 `A[j] | A[i]` ，并且对应因子也存在数组中（肯定在 $[0, i)$ )，就可以使用状态转移方程。

```java
// Time Complexity O(n^2)
class Solution {
    public int numFactoredBinaryTrees(int[] A) {
        Arrays.sort(A);
        Map<Integer, Long> dp = new HashMap<>();
        long ans = 0;
        long mod = (long)(1e9 + 7);
        
        for (int i = 0; i < A.length; i++) {
            dp.put(A[i], 1L);
            for (int j = 0; j < i; j++) {
                if (A[i] % A[j] == 0) {
                    int c = A[i] / A[j];
                    if (dp.containsKey(c)) {
                        long temp = dp.get(c) * dp.get(A[j]) % mod;
                        temp = (temp + dp.get(A[i])) % mod;
                        dp.put(A[i], temp);
                    }
                }
            }
            ans = (ans + dp.get(A[i])) % mod;
        }
        
        return (int)ans;
    }
}
```