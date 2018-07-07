---
title: Leetcode Contest 90 Solution
date: 2018-06-24 17:40:53
tags:
  - Leetcode
  - 总结
categories: 
  - 编程题
---

Link：[https://leetcode.com/contest/weekly-contest-90](https://leetcode.com/contest/weekly-contest-90)

昨晚看世界杯 🇩🇪 vs 🇸🇪 比赛看到四点，最后德国 17s 绝杀，看得真爽，然后早上就起不来了... 下午写完，第 1 题 bruteForce，第 2 题 recursion or stack，第 3 题 Math，第 4 题 topK 问题 Sort + PriorityQueue。

<!-- more -->

# 859. Buddy Strings: BruteForce

So easy, just two situations

- A == B, and there are at least two letters in A are same.
- A != B, and there are at most two different positions and  swapping them should result in A == B.

```java
// Time Complexity O(N), Space Complexity O(1)
class Solution {
    public boolean buddyStrings(String A, String B) {
        if (A == null || B == null || A.length() != B.length()) return false;
        
        int count = 0;
        int[] index = new int[3];
        boolean flag = false;
        int[] f = new int[26];
        
        for (int k = 0; k < A.length(); k++) {
            if (A.charAt(k) != B.charAt(k)) index[count++] = k;
            else {
                f[A.charAt(k)-'a']++;
                if (f[A.charAt(k)-'a'] >= 2) flag = true;
            }
            if (count > 2) return false;
        }
        
        if (count == 2 && A.charAt(index[0]) == B.charAt(index[1]) && A.charAt(index[1]) == B.charAt(index[0])) return true;
        if (count == 0 && flag) return true;
        
        return false;
    }
}
```

# 856. Score of Parentheses

## Stack + 递推

这道题还有点意思，我首先是拿 Stack 做的，由于每一个 ')' 必定对应一个 balanced parentheses，所以将 score 保存在右括号所在的 position。

碰到 ')' 就先计算一下自身的 score (A) 的情况，再将之前串联 AB 的 score 也存储到当前位置，这样一直递推到 score[n-1]。

```java
// Time Complexity O(N), Space O(N)
class Solution {
    public int scoreOfParentheses(String S) {
        if (S == null || S.length() == 0) return 0; 
        
        int n = S.length();
        int[] score = new int[n];
        int lastRight = -1;
        int ans = 0;
        Stack<Integer> stk = new Stack<>();
        
        for (int i = 0; i < n; i++) {
            if (S.charAt(i) == '(') {
                stk.push(i);
            } else {
                int left = stk.pop();
                if (S.charAt(i-1) == ')') score[i] = 2 * score[i-1];
                else score[i] = 1;
                if (left > 0 && S.charAt(left-1) == ')') score[i] += score[left-1];
            }
        }
        
        return score[n-1];
    }
}
```

## recursive solution

既然能用 Stack 求解，那么自然也就会设想能否用递归来减小空间复杂度。这道题也可以直接用递归求解。

假设 S = ABC... 是由 n 个串联的 balanced parentheses 组成的 ($n \ge 1$)，那么只要 traverse S and find each $A_i$，将 Ai 拆解成 (A)，在把 A 抛给 scoreOfParentheses 求解即可，最后将所有串联的 score 相加就可以得到答案，代码更加简练了。

```java
// Time Complexity O(N), Space O(1)
class Solution {
    public int scoreOfParentheses(String S) {
        if (S == null || S.length() == 0) return 0; 
        
        int left = 0, score = 0, last = 0;
        for (int i = 0; i < S.length(); i++) {
            if (S.charAt(i) == '(') left++;
            else left--;
            if (left == 0) {
                if (last == i-1) score += 1;
                else score += 2 * scoreOfParentheses(S.substring(last+1, i));
                last = i+1;
            }
        }
        return score;
    }
}
```

# 858. Mirror Reflection: Math

数学题，涉及到 Euclid gcd。If we draw a picture, the solution will be obvious.

![](https://i.loli.net/2018/06/24/5b2f703e49fab.jpg)

从图上可以看出，只要我们拿到 p, q 的 least common multiple，就可以通过 p % 2, q % 2 来反映最后到底是哪个 receptor 接收了激光。

```java
// Time Complexity O(logN)
class Solution {
    int gcd(int a, int b) {
        if (b == 0) return a;
        return gcd(b, a%b);
    }
    public int mirrorReflection(int p, int q) {
        int lcm = p * q / gcd(p, q);
        int pi = lcm / p, qi = lcm / q;
        
        if (pi % 2 == 1) {
            if (qi % 2 == 0) return 2;
            else return 1;
        } else {
            return 0;            
        }
    }
}
```

# 857. Minimum Cost to Hire K Workers

## TopK 问题: Sort + PriorityQueue

挺 nice 的一道题，用公式总结，即选 K 个 worker 满足
$$
\min\{\max\{\frac{wage[i]}{quality[i]}\} * \sum_k quality[i]\}
$$
先按 ratio = wage / quality 从小到大排序 (NlogN)，再遍历一遍，每次都保存前 K-1 个最小的 quality (top K 问题)，加上当前遍历到的 worker 组成一个 group，求一下 cost，然后更新 minCost = min{cost, minCost} 和 k-1 个最小的 quality。

**证明：**最后的结果肯定是找到一个 K group， maxRatio * totalQuality，group 中其它的 ratio 必然小于 maxRatio。

这正好符合我们按 ratio 从小到大排序，然后在所有比当前 ratio 小的 workers 中找 k-1 workers 的逻辑。

```java
// Time Complexity O(NlogN + NlogK)
class Solution {
    class Worker{
        int quality;
        double ratio;
        Worker(double ratio, int quality) {
            this.quality = quality;
            this.ratio = ratio;
        }
    }
    
    public double mincostToHireWorkers(int[] quality, int[] wage, int K) {        
        Worker[] w = new Worker[quality.length];
        for (int i = 0; i < quality.length; i++) {
            w[i] = new Worker((double) wage[i] / quality[i], quality[i]);
        }
        
        Arrays.sort(w, (a, b) -> Double.compare(a.ratio, b.ratio));
        
        PriorityQueue<Integer> q = new PriorityQueue<>((a, b) -> Integer.compare(b,a));
        int minSum = 0;
        double min = Integer.MAX_VALUE;
        
        for (int i = 0; i < w.length; i++) {
            if (q.size() < K-1) {
                minSum += w[i].quality;
                q.offer(w[i].quality);
            } else {
                min = Math.min(min, w[i].ratio * (minSum + w[i].quality));
                if (!q.isEmpty() && q.peek() > w[i].quality)  {
                    minSum = minSum - q.poll() + w[i].quality;
                    q.offer(w[i].quality);
                }
            }
        }
        return min;
    }
}
```