---
title: Leetcode Contest 83 Solution
date: 2018-05-09 10:23:29
tags: 
  - Leetcode
  - 总结
categories: 
  - 编程题
---

Link：[https://leetcode.com/contest/weekly-contest-83](https://leetcode.com/contest/weekly-contest-83)

上周期末考试，轮空一周，本周继续更。第 1、2 题字符串处理，第 3 题 Math ，第 4 题 Three Pointers。

<!-- more -->

# 829. Consecutive Numbers Sum

Given a positive integer `N`, how many ways can we write it as a sum of consecutive positive integers?

```
Example 1:
Input: 15
Output: 4
Explanation: 15 = 15 = 8 + 7 = 4 + 5 + 6 = 1 + 2 + 3 + 4 + 5
```

**Notes:**

- `1 <= N <= 10 ^ 9`

## Math

这道题的思路，就是用数学关系指导判断条件。

Suppose the start number of consecutive positive integers is x, we can write the formula of sum of k consecutive positive integers as 
$$
\begin{align}
x + (x+1) &+ ...+ (x+k-1) = N \\
kx &+ \frac{k(k-1)}{2} = N \\
kx &= N - \frac{k(k-1)}{2}
\end{align}
$$
formula (3) indicates some conditions.
$$
\begin{align}
N - \frac{k(k-1)}{2} > 0 &\Rightarrow \text{approximately } k\le\sqrt{2N} + 1 \\
k &\ge 1 \\
k | N &- \frac{k(k-1)}{2}
\end{align}
$$
We can enum k from 1 to $\sqrt{2N} +1$, and find the k which satisfies the formula (6).

```java
// Time Complexity O(sqrt(N))
class Solution {
    public int consecutiveNumbersSum(int N) {
        int up = (int) Math.sqrt(N * 2) + 1;
        int ans = 0;
        
        for (int k = 1; k <= up; k++) {
            if (k * (k-1) < N * 2 && (N-(k-1) * k/2) % k == 0) {
                ans++;
            }
        }
        
        return ans;
    }
}
```
# 828. Unique Letter String

A character is unique in string `S` if it occurs exactly once in it.

For example, in string `S = "LETTER"`, the only unique characters are `"L"` and `"R"`.

Let's define `UNIQ(S)` as the number of unique characters in string `S`.

For example, `UNIQ("LETTER") =  2`.

Given a string `S` with only uppercases, calculate the sum of `UNIQ(substring)` over all non-empty substrings of `S`.

If there are two or more equal substrings at different positions in `S`, we consider them different.

Since the answer can be very large, retrun the answer modulo `10 ^ 9 + 7`.

```
Example 2:
Input: "ABC"
Output: 10
Explanation: All possible substrings are: "A","B","C","AB","BC" and "ABC".
Evey substring is composed with only unique letters.
Sum of lengths of all substring is 1 + 1 + 1 + 2 + 2 + 3 = 10
```

**Note:**

- `0 <= S.length <= 10000.`

## Three pointers

因为只可能有大写字母，用三个指针数组 left, mid, right[26] 来保存某一个字母连续的三个位置，从左到右扫一遍，每次遇到一个字母，更新一次 `left = mid，mid = right, right = i `，并且将 mid 所在位置的字母的贡献存入 ans，因为 mid 所在位置的字母无法对包含 right 位置右边字符的子串产生影响（unique）。注意最后需要更新一次 ans。

```java
// Time Complexity O(n)
class Solution {
    public int uniqueLetterString(String S) {
        if (S == null || S.length() == 0) return 0; 
        
        long ans = 0;
        final long cons = (long)(1e9 + 7);
        
        int[] left = new int[26], mid = new int[26];
        int[] right = new int[26];
        
        int l = S.length();
        for (int i = 0; i < left.length; i++) left[i] = mid[i] = right[i] = -1;
        
        for (int i = 0; i < l; i++) {
            int c = S.charAt(i) - 'A';
            left[c] = mid[c];
            mid[c] = right[c];
            right[c] = i;
            if (mid[c] != -1) {
                ans = (ans + (mid[c] - left[c]) * (right[c] - mid[c])) % cons;
            }
        }
        
        for (int i = 0; i < 26; i++) {
            if (right[i] != -1) {
                ans = (ans + (l - right[i]) * (right[i] - mid[i])) % cons;
            }
        }
        
        return (int)ans;
    }
}
```
