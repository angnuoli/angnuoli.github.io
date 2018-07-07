---
title: Leetcode Contest 78 Solution
date: 2018-04-01 11:38:13
tags: 
  - Leetcode
  - 总结
categories: 
  - 编程题
---



Link：[https://leetcode.com/contest/weekly-contest-78](https://leetcode.com/contest/weekly-contest-78)

Well, problems are a little bit tricky in this week, problem 1 is map, prob 2 is string, prob 3 is dp and prob 4 is math。

<!-- more -->

# Subdomain Visit Count

Given a String[], return the visit count of subdomains. 

```
Example 2:
Input: 
["900 google.mail.com", "50 yahoo.com", "1 intel.mail.com", "5 wiki.org"]
Output: 
["901 mail.com","50 yahoo.com","900 google.mail.com","5 wiki.org","5 org","1 intel.mail.com","951 com"]
Explanation: 
We will visit "google.mail.com" 900 times, "yahoo.com" 50 times, "intel.mail.com" once and "wiki.org" 5 times. For the subdomains, we will visit "mail.com" 900 + 1 = 901 times, "com" 900 + 50 + 1 = 951 times, and "org" 5 times.
```

## Hash Table

Easy, one pass with HashMap for counting.

```java
// Time Complexity O(∑len(cpdomains[i]))
class Solution {
    public List<String> subdomainVisits(String[] cpdomains) {
        Map<String, Integer> map = new HashMap<>();
        
        for (String cpdomain: cpdomains) {
            int i = cpdomain.indexOf(' ');
            int x = Integer.valueOf(cpdomain.substring(0, i));
            cpdomain = cpdomain.substring(i+1);
            do {
                if (map.containsKey(cpdomain)) {
                    map.put(cpdomain, map.get(cpdomain) + x);
                } else {
                    map.put(cpdomain, x);
                }
                i = cpdomain.indexOf('.');
                if (i != -1) {
                    cpdomain = cpdomain.substring(i+1);
                }
            } while (i != -1);
        }
        
        List<String> ans = new ArrayList<>();
        
        for (Map.Entry<String, Integer> e : map.entrySet()) {
            ans.add(e.getValue() + " " + e.getKey());
        }
        return ans;
    }
}
```
# Expressive Words

Given a string S. Every continuous substring with duplicate letters of which the length is no less than 3, such as "eee" or "ooo", can match "e{1, n}" where n is the length of repeat letters. If the length is less than 3, it should match exactly the substring, where "ll" only matches "ll".

Given a list of words, return the number of matched words.

```
Example:
Input: 
S = "heeellooo"
words = ["hello", "hi", "helo"]
Output: 1
Explanation: 
We can extend "e" and "o" in the word "hello" to get "heeellooo".
We can't extend "helo" to get "heeellooo" because the group "ll" is not extended.
```

## Regex

Convert String S to regex pattern using rules stated above. 

Compile each word with the pattern.

```java
// Time Complexity O(len(S) + ∑len(words[i]))
class Solution {
    public int expressiveWords(String S, String[] words) {
        S += "X";
        int i = 0;
        StringBuilder regex = new StringBuilder();
        while (i < S.length() - 1) {
            int n = 1;
            while (i < S.length() - 1 && S.charAt(i) == S.charAt(i+1)) {
                i++;
                n++;
            }
            if (n >= 3) {
                regex.append(S.charAt(i) + "{1," + n + "}");
            } else {
                regex.append(S.substring(i-n+1, i+1));
            }
            i++;
        }
        String re = regex.toString();
        int ans = 0;
        for (String word : words) {
            if (word.matches(re)) ans++;
        }
        return ans;
    }
}
```
# Soup Servings

这道题还是挺 tricky 的，我看了一下前面的人，清一色设置 $N > X000$ 时直接返回 1....

剩下的可以用记忆化搜索做。 

```
Example:
Input: N = 50
Output: 0.625
Explanation: 
If we choose the first two operations, A will become empty first. For the third operation, A and B will become empty at the same time. For the fourth operation, B will become empty first. So the total probability of A becoming empty first plus half the probability that A and B become empty at the same time, is 0.25 * (1 + 1 + 0.5 + 0) = 0.625.
```

## DP

记忆化搜索，挺模式化的一道题，然而这 N 的人工设置实在是....

```java
// Time Complexity O(n^2)
class Solution {
    
    double[][] map;
    public double soupServings(int N) {
        if (N > 5000) return 1;
        map = new double[N+1][N+1];
        return dfs(N, N, 1);
    }
    double ans = 0;
    
    double dfs(int A, int B, double pro) {
        if (A < 0) A = 0;
        if (B < 0) B = 0;
        
        if (map[A][B] != 0) {
            return map[A][B];
        } 
        
        if (A <= 0 && B <= 0) {
            return pro / 2;
        } else if (A <= 0) {
            return pro;
        } else if (B <= 0) {
            return 0;
        }
        double temp = dfs(A - 100, B, pro / 4)
                        + dfs(A - 75, B - 25, pro / 4)
                        + dfs(A - 50, B - 50, pro / 4)
                        + dfs(A - 25, B - 75, pro / 4);
        
        map[A][B] = temp;
        return temp;
    }
}
```
# Chalkboard XOR Game

给一个 int 序列 nums，Alice 和 Bob 每次可以从中抹去一个元素，Alice 先手，输出 Alice 是否能赢。

胜负条件：设 nums 所有元素异或为 s

1. 初始 s 为 0，直接胜出。


2. 抹去一个元素，使得剩余元素异或为 0 的为输家。

取石子游戏的变种。 

```
Example:
Input: nums = [1, 1, 2]
Output: false
Explanation: 
Alice has two choices: erase 1 or erase 2. 
If she erases 1, the nums array becomes [1, 2]. The bitwise XOR of all the elements of the chalkboard is 1 XOR 2 = 3. Now Bob can remove any element he wants, because Alice will be the one to erase the last element and she will lose. 
If Alice erases 2 first, now nums becomes [1, 1]. The bitwise XOR of all the elements of the chalkboard is 1 XOR 1 = 0. Alice will lose.
```

**Note:**

- `1 <= N <= 1000`. 
- `0 <= nums[i] <= 2^16`.

## Math

这道题还是比较 tricky 的，discuss 里面也有人抱怨说这题没啥意义……我反正没做出来，看了一眼题解，大致思路是先求

$$
S = X_1 \oplus X_2 \oplus...\oplus X_n
$$

若 $S = 0$，Alice 直接胜出。

若 $S\ne 0$，取任意元素 $X_i$ ，剩余元素异或可以表示为 $S \oplus X_i$ 。

1. 如果 Alice 取的时候，nums 的数量为偶数，Alice 必有可以移动的位置。

   假设 nums 数量为偶数，且 Alice 将在这一步输，那么 $\forall X_i, \ S \oplus X_i = 0$ ，which means
   $$
   \begin{align*}
   0 = (S\oplus X_1) \oplus (S\oplus X_2) \oplus ...\oplus (S\oplus X_n) &= (S\oplus...\oplus S) \oplus (X_1\oplus X_n) \\ 
   &= 0 \oplus S \\
   & \ne 0 
   \end{align*}
   $$
   导出矛盾，所以 Alice 总有可以移动的位置。

2. 如果 Alice 取的时候，nums 的数量为奇数，Alice 必输。

   显然 Alice 取了一个之后，Bob 面对的数量必然为偶数，根据 1，Bob 必有可以移动的位置，当只剩最后一个的时候，Alice 取了之后必输。

以上得证，仅需判断 `s == 0 || nums.length % 2 == 0`.

```java
// Time Complexity O(n)
// Space Complexity O(1)
class Solution {
    public boolean xorGame(int[] nums) {
        int s = 0;
        for (int num: nums) s ^= num;
        return s == 0 || nums.length % 2 == 0;
    }
}
```
