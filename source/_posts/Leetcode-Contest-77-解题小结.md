---
title: Leetcode Contest 77 解题小结
date: 2018-03-25 00:17:49
tags: 
  - Leetcode
  - 总结
categories: 
  - 编程题
---

原题链接：[https://leetcode.com/contest/weekly-contest-77](https://leetcode.com/contest/weekly-contest-77)

本周感觉难度不大....三道模拟，一道 DP。

<!-- more -->

# Number of Lines To Write String

给定一个字符宽度数组 width[a..z]，一个字符串 S。打印字符串，每行宽度限制为100，不能截断字符（换行）。

1. 能打多少行
2. 最后一行的打印宽度

模拟。

1. 将 A 看成首尾相接循环串，每次以 A[i] 字符为开头，截取其中长度为 A.length 的子串，与 B 进行对比，如果匹配则返回 True，直到所有子串都轮询一遍仍没有匹配的子串则返回 False。

   ```java
   // Time Complexity O(len(S))
   class Solution {
       public int[] numberOfLines(int[] widths, String S) {
           char[] temp = S.toCharArray();
           
           int line = 1, linew = 0;
           for (char c : temp) {
               int x = (int) (c - 'a');
               if (linew + widths[x] > 100) {
                   line++;
                   linew = widths[x];
               } else {
                   linew += widths[x];
               }
           }
           return new int[]{line, linew};
       }
   }
   ```

# Unique Morse Code Words

给定一个字符 -> Morse Code 映射 String[a..z]，一个字符串数组 words[]，将所有字符串翻译成对应的 Morse Code 串，求不同串的数目。

模拟。

1. 转换字符串 -> insert in HashSet -> return HashSet.size()

   ```java
   // Time Complexity O(∑len(word))
   class Solution {
       public int uniqueMorseRepresentations(String[] words) {
           String[] code = new String[]{".-","-...","-.-.","-..",".","..-.","--.","....","..",".---","-.-",".-..","--","-.","---",".--.","--.-",".-.","...","-","..-","...-",".--","-..-","-.--","--.."};
           Set<String> set = new HashSet<>();
           
           for (String word: words) {
               String res = trans(word, code);
               set.add(res);
           }
           
           return set.size();
       }
       
       String trans(String word, String[] code) {
           StringBuilder res = new StringBuilder();
           for (char c: word.toCharArray()) {
               res.append(code[c - 'a']);
           }
           return res.toString();
       }
   }
   ```

# Max Increase to Keep City Skyline

给定一个 `grid[][]` 矩阵，`grid[i][j]`代表 (i,j) 建筑物的高度，我们可以增加任意建筑物的高度，但保持上下左右四个视图与原建筑矩阵相同，求所有建筑物最多能增加多少高度（与原矩阵的高度差）。

```
Example:
Input: grid = [[3,0,8,4],[2,4,5,7],[9,2,6,3],[0,3,1,0]]
Output: 35

Explanation: 
The grid is:
[ [3, 0, 8, 4], 
  [2, 4, 5, 7],
  [9, 2, 6, 3],
  [0, 3, 1, 0] ]
gridNew = [ [8, 4, 8, 7],
            [7, 4, 7, 7],
            [9, 4, 8, 7],
            [3, 3, 3, 3] ]
```

模拟。

1. 求行列最大高度，`grid_new[i][j]`为两者取 min，这样不会影响视图且最优。

   ```java
   // Time Complexity O(n^2)
   class Solution {
       public int maxIncreaseKeepingSkyline(int[][] grid) {
           int ans = 0;
           if (grid.length == 0 || grid[0].length == 0) return ans;
           
           int[] maxrow = new int[grid.length];
           int[] maxcol = new int[grid[0].length];
           
           for (int i = 0; i < grid.length; i++) {
               for (int j = 0; j < grid[0].length; j++) {
                   maxrow[i] = Math.max(maxrow[i], grid[i][j]);
                   maxcol[j] = Math.max(maxcol[j], grid[i][j]);
               }
           }
           
           for (int i = 0; i < grid.length; i++) {
               for (int j = 0; j < grid[0].length; j++) {
                   ans += Math.min(maxrow[i], maxcol[j]) - grid[i][j];
               }
           }
           
           return ans;
       }
   }
   ```

# Split Array With Same Average

给一个 int 序列 A[]，每个元素可以选择放到两个初始为空的序列 B 或 C 中，全部元素都必须放到 B 或 C 中。能否找到一种分割策略，使 B 和 C 的平均值相同。 

```
Example :
Input: 
[1,2,3,4,5,6,7,8]
Output: true
Explanation: We can split the array into [1,4,5,8] and [2,3,6,7], and both of them have the average of 4.5.
```

**Note:**

- The length of `A` will be in the range [1, 30].
- `A[i]` will be in the range of `[0, 10000]`.

## DP

> [English explanation.](https://leetcode.com/problems/split-array-with-same-average/discuss/120729/Java-Solution-using-DP-with-explanation)

我一开始想到的是 dp，用 `f[t][j] = true` 代表子序列可以凑出 $avg =  \frac{t}{j}$ 。已知 `f[t][j]`的情况下，我们假设 A 可以分成两个序列 B, C，长度为 `lb + lc = la`，那么 B, C 满足一些性质：

1. $avg = \frac{A}{la} = \frac{B}{lb} = \frac{C}{lc}$ 三个序列的平均值均相等。avg 是已知的，那么 $B = avg * lb, C = avg * lc$ 且 $B, C\in N$.

这就十分 nice，那么我可以枚举 $lb\in [1, A.length-1]$，通过 `lb` 可以求出 `B, C, lc`，判断 `f[B][lb] && f[C][lc]` 是否为 True，如果是，那么表示假设成立。

问题来了，B、C 是否不相交呢？注意，因为可以有重复的元素存在，相交是指包含相同的元素而不是相同值的元素，`[1,2,2,3] -> [1,2],[2,3]` 不相交，而`[1,2,2,3] -> [1,2,2],[2,3]` 则相交。 

假设 B、C 是相交的，相交子集为 K。

那么
$$
avg = \frac{A}{la} = \frac{B+C-K}{lb+lc-lk} \\
\because \frac{B}{lb} = \frac{C}{lc}=\frac{A}{la} \\
\therefore \frac{B+C-K}{lb+lc-lk} - \frac{B}{lb} = 0 \\
\frac{B\cdot lb + C\cdot lb - K\cdot lb - B\cdot lb - B \cdot lc + B\cdot lk}{(lb+lc-lk)\cdot lb}=\frac{B\cdot lk - K\cdot lb}{(lb+lc-lk)\cdot lb} \\
\Rightarrow\frac{B}{lb} = \frac{K}{lk}\\
\Rightarrow\frac{B-K}{lb-lk} = \frac{B}{lb} = avg
$$
以上证明，说明将子集 K 从 B 中剥离出去得到 B-K，其平均值也是 avg，那么我们仍然可以得到两个不相交的子序列。

那么这个方法是可行的。

```java
// Time Complexity O(n^2 * sum)
class Solution {
    public boolean splitArraySameAverage(int[] A) {
        if (A.length <= 1) return false;
        int sum = 0;
        for (int aA : A) sum += aA;

        boolean[][] f = new boolean[sum+1][A.length+1];
        f[0][0] = true;

        for (int i = 0; i < A.length; i++) {
            for (int t = sum; t >= A[i]; t--) {
                for (int j = 1; j <= i+1; j++) {
                    f[t][j] = f[t][j] | f[t-A[i]][j-1];
                }
            }
        }
        
        for (int i = 1; i <= A.length / 2; i++) {
            if (sum * i % A.length == 0) {
                int b = sum * i / A.length;
                if (f[b][i]) return true;
            }
        }

        return false;
    }
}
```

