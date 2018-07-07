---
title: Leetcode Contest 75 解题小结
date: 2018-03-11 21:07:19
tags: 
  - Leetcode
  - 总结
categories: 
  - 编程题
---

写小结的目的，主要是在于想让自己能写代码的同时，也能把自己的思路写出来。

原题链接：[https://leetcode.com/contest/weekly-contest-75](https://leetcode.com/contest/weekly-contest-75)

# Rotate String

给两个字符串 A 和 B。每次可以将 A 的最左边字符移到最右边的位置，'abcde' -> 'bcdea'，可以移动任意次。问 A 能否得到 B。

字符串处理。

<!-- more -->

1. 将 A 看成首尾相接循环串，每次以 A[i] 字符为开头，截取其中长度为 A.length 的子串，与 B 进行对比，如果匹配则返回 True，直到所有子串都轮询一遍仍没有匹配的子串则返回 False。

  ```java
  // Time Complexity O(n^2)
  class Solution {
      public boolean rotateString(String A, String B) {
          char[] tempA = A.toCharArray();
          char[] tempB = B.toCharArray();
          int n = A.length();
          if (A.length() != B.length()) return false;
          for (int i = 0; i < n; i++) {
              boolean flag = true;
              for (int j = 0; j < n; j++) {
                  int k = (i + j) % n;
                  if (tempA[k] != tempB[j]) flag = false;
              }
              if (flag) return true;
          }
          return false;
      }
  }
  ```


2. 将两个字符串 A 拼接在一块 A + A，然后查找 B 是否是其子串。

  ```java
  class Solution {
      public boolean rotateString(String A, String B) {
          return (A+A).contains(B);
      }
  }
  ```

# All Paths From Source to Target

给一个有向无环图 G = (V, E)，包含 N 个 nodes。Input `graph[i]`代表从 node i 出发的所有边。返回所有从 0 到 N-1 的路径列表。路径之间可以任意顺序排列，路径中的节点顺序不能打乱。N 的范围 [2,15]。

```
Example:
Input: [[1,2], [3], [3], []] 
Output: [[0,1,3],[0,2,3]] 
Explanation: The graph looks like this:
0--->1
|    |
v    v
2--->3
There are two paths: 0 -> 1 -> 3 and 0 -> 2 -> 3.
```

DFS。

1. 从0出发 DFS 所有路径，用 ArrayList 依序保存当前路径上的所有节点，当访问到 N-1 的时候，将路径存储到 answer 路径列表中。

   ```java
   // Time Complexity O(all paths from 0)
   class Solution {
       List<List<Integer>> ans = new ArrayList<>();
       
       public List<List<Integer>> allPathsSourceTarget(int[][] graph) {
           if (graph.length == 0) return ans;
           dfs(0, graph, new ArrayList<>());
           return ans;
       }
       
       void dfs(int node, int[][] graph, List<Integer> path) {
           path.add(node);
           if (node == graph.length-1) {
               ans.add(new ArrayList<>(path));
               return;
           }
           for (int next: graph[node]) {
               dfs(next, graph, path);
               path.remove(path.size()-1);
           }
       }
   }
   ```

# Champagne Tower

如图，一个由酒杯搭建而成的香槟金字塔，每个酒杯装满后会向两边平均溢出多余的酒，已知从顶层倒 n 杯酒（n 非负数），当所有酒杯都不溢出时，求第 i 行第 j 个酒杯装了多少酒（both i and j are 0 indexed），如1杯、0.5杯。

![酒杯](https://i.loli.net/2018/03/25/5ab74a27dfc17.jpg)

```
Example 1:
Input: poured = 1, query_glass = 1, query_row = 1
Output: 0.0
Explanation: We poured 1 cup of champange to the top glass of the tower (which is indexed as (0, 0)). There will be no excess liquid so all the glasses under the top glass will remain empty.
```

**Note:**

- `poured` will be in the range of `[0, 10 ^ 9]`.
- `query_glass` and `query_row` will be in the range of `[0, 99]`.

简易 DP，递推公式都告诉你了，`f[i,j]=max(f[i-1][j-1]-1,0)/2 + max(f[i-1][j]-1,0)/2`.

1. 用 `list<list>` 来表示一个动态二维数组。

   ```java
   // Time Complexity O(query_row * query_row) 66ms
   class Solution {
       public double champagneTower(int poured, int query_row, int query_glass) {
           if (query_row == 0) return Math.min(poured, 1);
           List<List<Double>> f = new ArrayList<>();
           f.add(new ArrayList<Double>());
           f.get(0).add((double)poured); // f[0][0] = poured;
           
           for (int i = 1;; i++) {
               List<Double> last = f.get(i-1);
               List<Double> cur = new ArrayList<Double>();
               for (int j = 0; j <= i; j++) {
                   //f[i][j] = max(f[i-1][j-1]-1,0)/2 + max(f[i-1][j]-1,0)/2
                   double node = 0;
                   if (j-1 >= 0) node += Math.max(last.get(j-1)-1, 0) / 2;
                   if (j < last.size()) node += Math.max(last.get(j)-1, 0) / 2;
                   if (i == query_row && j == query_glass) return node > 1 ? 1 : node;
                   cur.add(node);
               }
               f.add(cur);
           }
       }
   }
   ```

2. 两个一维滚动数组，代表上一层杯子和当前层杯子。

   ```java
   // Time complexity O(query_row, query_row)，但是数据结构变得更为简单，时间复杂度从 61ms 降至 31ms
   class Solution {
       public double champagneTower(int poured, int query_row, int query_glass) {
           if (query_row == 0) return Math.min(poured, 1);
           double[] d = {poured};
           
           for (int i = 1;; i++) {
               double[] f = new double[i+1];
               for (int j = 0; j <= i; j++) {
                   //f[i][j] = max(f[i-1][j-1]-1,0)/2 + max(f[i-1][j]-1,0)/2
                   if (j-1 >= 0) f[j] += Math.max(d[j-1]-1, 0) / 2;
                   if (j < d.length) f[j] += Math.max(d[j]-1, 0) / 2;
                   if (i == query_row && j == query_glass) return f[j] > 1 ? 1 : f[j];
               }
               d = f;
           }
       }
   }
   ```

3. 有些上层节点是无法影响到（query_row，query_col）节点的，我们可以不计算那些节点，求 j 位于[start_col, end_col] 范围中的节点，只有这些节点会对之后的待求节点产生影响。

   ```java
   // 31ms -> 26ms, 可能实际是因为随机原因减少的运行时间
   class Solution {
       public double champagneTower(int poured, int query_row, int query_glass) {
           if (query_row == 0) return Math.min(poured, 1);
           double[] d = {poured};
           
           for (int i = 1;; i++) {
               double[] f = new double[i+1];
               int start_col = Math.max(i - (query_row-query_glass), 0);
               int end_col = Math.min(query_glass, i);
               for (int j = start_col; j <= end_col; j++) {
                   //f[i][j] = max(f[i-1][j-1]-1,0)/2 + max(f[i-1][j]-1,0)/2
                   if (j-1 >= 0) f[j] += Math.max(d[j-1]-1, 0) / 2;
                   if (j < d.length) f[j] += Math.max(d[j]-1, 0) / 2;
                   if (i == query_row && j == query_glass) return f[j] > 1 ? 1 : f[j];
               }
               d = f;
           }
       }
   }
   ```

4. 基于解法2，可以将滚动数组合并，自己覆盖自己，因为`dp[i][j]`只会被`dp[i-1][j-1]、dp[i-1][j]`所影响，那么当我们从后往前更新时，新更新的值就不会影响 index 靠前的值，因为当前节点的更新只会影响 index 等于或者大于他的节点。

   ```java
   // 时间复杂度没有什么降低，空间复杂度降至O(query_row)
   class Solution {
       public double champagneTower(int poured, int query_row, int query_glass) {
           double[] dp = new double[101];
           dp[0] = poured;
           for (int i = 0; i < query_row; i++) {
               for (int j = i; j >= 0; j--) {
                   dp[j] = Math.max((dp[j]-1) / 2, 0);
                   dp[j+1] += dp[j];
               }
           }
           return Math.min(dp[query_glass], 1);
       }
   }
   ```

# Smallest Rotation with Highest Score

给一个序列 A，给一个非负的 index K，我们可以在 K 处旋转整个序列使其变成`A[K], A[K+1], A{K+2], ... A[A.length - 1], A[0], A[1], ..., A[K-1]`。之后每个值小于等于其新的 index 的 entry 都可以得到一分。求得到最大分数的 K，如果有多个 K，输出最小的。 

```
Example 1:
Input: [2, 3, 1, 4, 0]
Output: 3
Explanation:  
Scores for each K are listed below: 
K = 0,  A = [2,3,1,4,0],    score 2
K = 1,  A = [3,1,4,0,2],    score 3
K = 2,  A = [1,4,0,2,3],    score 3
K = 3,  A = [4,0,2,3,1],    score 4
K = 4,  A = [0,2,3,1,4],    score 3
```

**Note:**

- `A` will have length at most `20000`.
- `A[i]` will be in the range `[0, A.length]`.

A 的范围预示着时间复杂度可能是 O(n) 级别的，DP。

枚举 K -> [0, N)。rotate 数组之后的得到的新坐标和原坐标之间存在着线性关系，可以用式子

`index_after = (index + N - K) % N ` 表示，得分的条件是`A[i] - index_after <= 0`，解得 `K <= (index - A[i] + N) % N`。这个式子意味着，当 K 大于`(index - A[i] + N) % N`时，entry i 永远无法得分，即 K 的临界值为`K' = (index - A[i] + N + 1) % N`，可以用数组累加失分点 `loss[(index - A[i] + N + 1) % N] += 1`。

那么什么时候得分呢？题目只是要求输出得到最大分数的 K，而不需要计算最大分数，所以我们可以假设一个参考平面`score[0]`。当 K 增加1的时候，除了第一个元素之外所有 entry 的 index 都将减 1（相对 K 得到的序列），index 减少只会失分，由 `loss[K]`表示；第一个元素将被移到最后，如果元素的值为 `A[i] in [1, A.length)`，那么他肯定能得到一分。这样我们可以得到状态转移方程：`score[K] = score[K-1] + 1 - loss[K], score[0] = 1 - loss[K]`

考虑两个特殊情况 `A[i] = 0 or A.length`，其临界点`K' = (index - A[i] + N + 1) % N = (index + 1) % N`，可以看出值为 0 或 A.length 的元素的临界点都是其坐标加1，即它在失分的时候，同样它也会帮助我们得到一分，即无影响。这也符合 0 <= index 和 N > index 不随 rotate 而改变的情况。

然后寻找$\mathop{\arg\max}\limits_{K} \{score[K]\}$。

```
class Solution {
    public int bestRotation(int[] A) {
        int N = A.length;
        int max_i = 0;
        int[] score = new int[N+1];
        for (int i = 0; i < N; i++) score[(i-A[i]+N+1) % N] -= 1;
        for (int i = 1; i < N; i++) {
            score[i] += score[i-1] + 1;
            max_i = score[i] > score[max_i] ? i : max_i;
        }
        return max_i;
    }
}
```

也可以直接先把 K=0 时的 score 求出来，这样递推可以的到每个 K 得到的 score 的绝对值。

```java
class Solution {
    public int bestRotation(int[] A) {
        int N = A.length;
        int max_K = 0;
        int[] score = new int[N+1];
        int[] loss = new int[N+1];

        // the change of index is index = (i + N - K) % N, 
        //   so A[i] - index <= 0 will lead to following formula.
        //   lose point happens at K > i - A[i] + N, 
        //   each element will get point or lose point only once
        for (int i = 0; i < N; i++) {
            loss[(i-A[i]+N+1) % N] -= 1;
            if (A[i] <= i) score[0] += 1;
        }
        if (A[N-1] == A.length) loss[0]++; // special case 0 or A.length
        for (int K = 1; K < N; K++) {
            score[K] = score[K-1] + 1 + loss[K];
            max_K = score[K] > score[max_K] ? K : max_K;
        }
        return max_K;
    }
}
```


