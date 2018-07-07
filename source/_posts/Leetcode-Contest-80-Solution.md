---
title: Leetcode Contest 80 Solution
date: 2018-04-14 23:13:44
tags: 
  - Leetcode
  - 总结
categories: 
  - 编程题
---

Link：[https://leetcode.com/contest/weekly-contest-80](https://leetcode.com/contest/weekly-contest-80)

Problem 1 and 2 are easy, so I don't want to talk about them, problem 3 is string manipulation and search (pay attention to edge case), problem 4 is dp.

<!-- more -->

# 3. Ambiguous Coordinates

We had some 2-dimensional coordinates, like `"(1, 3)"` or `"(2, 0.5)"`.  Then, we removed all commas, decimal points, and spaces, and ended up with the string `S`.  Return a list of strings representing all possibilities for what our original coordinates could have been.

Our original representation never had extraneous zeroes, so we never started with numbers like "00", "0.0", "0.00", "1.0", "001", "00.01", or any other number that can be represented with less digits.  Also, a decimal point within a number never occurs without at least one digit occuring before it, so we never started with numbers like ".1".

The final answer list can be returned in any order.  Also note that all coordinates in the final answer have exactly one space between them (occurring after the comma.)

```
Example 2:
Input: "(00011)"
Output:  ["(0.001, 1)", "(0, 0.011)"]
Explanation: 
0.0, 00, 0001 or 00.01 are not allowed.
```

**Notes:**

- `4 <= S.length <= 12`.
- `S[0]` = "(", `S[S.length - 1]` = ")", and the other elements in `S` are digits.

## String

In this problem, I just enum all possible cases.

1. Insert a comma into the string to partition it into two parts, (s1, s2). O(n).
2. Enum and combine all valid numbers which come from s1 and s2 by inserting a decimal point or not. O(n).

```java
// Time Complexity O(n^2)
class Solution {
    List<String> ans = new ArrayList<>();
    
    public List<String> ambiguousCoordinates(String S) {
        if (S.length() == 0) return null;
        
        S = S.substring(1, S.length()-1);
        for (int i = 1; i < S.length(); i++) {
            find(S.substring(0, i), S.substring(i));
        }
        
        return ans;
    }
    
    void find(String s1, String s2) {
        int l1 = s1.length();
        int l2 = s2.length();
        List<String> ans1 = new ArrayList<>();
        List<String> ans2 = new ArrayList<>();
        
        if (isValid(s1)) ans1.add(s1);
        if (isValid(s2)) ans2.add(s2);
        
        for (int i = 1; i < l1; i++) {
            String str1 = s1.substring(0,i);
            String str2 = s1.substring(i);
            if (isValid(str1, str2)) ans1.add(str1 + "." + str2);
        }
        
        for (int i = 1; i < l2; i++) {
            String str1 = s2.substring(0,i);
            String str2 = s2.substring(i);
            if (isValid(str1, str2)) ans2.add(str1 + "." + str2);
        }
        
        for (String str1 : ans1) {
            for (String str2 : ans2) {
                ans.add("(" + str1 +", " + str2 + ")");
            }
        }
    }
    
    boolean isValid(String s) {
        // check the denominator
        if (s.length() == 0) return false;
        if (s.length() == 1) return true;
        if (s.charAt(0) == '0') return false;
        return true;
    }
    
    boolean isValid(String s1, String s2) {
        if (!isValid(s1)) return false;
        // edge case, 1.0 is invalid
        if (s2.length() == 1 && s2.charAt(0) == '0') return false;
        
        // reverse the numerator and check in the same way as denominator
        StringBuilder str = new StringBuilder(s2);
        if (!isValid(str.reverse().toString())) return false;
        return true;
    }
}
```
# 4. Race Car

Your car starts at position 0 and speed +1 on an infinite number line.  (Your car can go into negative positions.)

Your car drives automatically according to a sequence of instructions A (accelerate) and R (reverse).

When you get an instruction "A", your car does the following: `position += speed, speed *= 2`.

When you get an instruction "R", your car does the following: if your speed is positive then `speed = -1` , otherwise `speed = 1`.  (Your position stays the same.)

For example, after commands "AAR", your car goes to positions 0->1->3->3, and your speed goes to 1->2->4->-1.

Now for some target position, say the **length** of the shortest sequence of instructions to get there.

```
Example 2:
Input: 
target = 6
Output: 5
Explanation: 
The shortest instruction sequence is "AAARA".
Your position goes from 0->1->3->7->7->6.
```

## DP

The trick is that the speed is always the power of 2. If we go ahead n steps using A, we will move forward by 
$$
2^0 + 2^1 +...+2^{n-1} = 2^n - 1
$$
When we use R and speed becomes -1, it is the similar to go back n steps.

The algorithm is

1. let n = the length of binary bits of target

2. If target == $2^n - 1$, go n steps and achieve the target.

3. if target < $2^n - 1$

   1. we can go n steps and R, speed = -1;
   2. we can go n-1 steps and R; then go back i steps and R, $i \in [0, n-1)$, speed = 1;

   we only need to enum i once.

```java
// Time Complexity O(target)
class Solution {
    int[] dp;
    
    public int racecar(int target) {
        dp = new int[target+1];
        return helper(target);
    }
    
    int helper(int target) {
        if (target == 0 || dp[target] != 0) return dp[target];
        
        int res = Integer.MAX_VALUE;
        int n = Integer.toBinaryString(target).length();
        // if target == 2^n - 1, go n steps and achieve the target
        if (target == Math.pow(2,n) - 1) {
            dp[target] = n;
            return n;
        }
        // if target < 2^n - 1, go n steps and R
        int pos1 = (int)Math.pow(2, n) - 1;
        if (pos1 - target < target) {
            res = Math.min(res, helper(pos1 - target) + n + 1);
        }
        
        // go n-1 steps and R, go back i steps and R, i in [0, n-1)
        int pos2 = (int)Math.pow(2, n-1) - 1;
        for (int i = 0; i < n-1; i++) {
            // go back i steps
            int d = (int)Math.pow(2, i) - 1;
            res = Math.min(res, helper(target - pos2 + d) + n + 1 + i);
        }
        
        dp[target] = res;
        return res;
    }
}
```
