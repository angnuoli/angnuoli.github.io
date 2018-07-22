---
title: Leetcode Contest 94 Solution
date: 2018-07-22 10:16:47
tags:
  - Leetcode
  - 总结
categories: 
  - 编程题
---

Link：[https://leetcode.com/contest/weekly-contest-94](https://leetcode.com/contest/weekly-contest-94)

解题速度实在是比不过大神...第 1 题 naïve，第 2 题 naïve，第 3 题二分，第 4 题 binary search。

<!-- more -->

# 872. Leaf-Similar Trees

第一题我就遍历了一遍 Tree，找了所有的叶子节点并存入 list，最后比较两个 list 是否相同，感觉时间 O(n) Space  O(n) 不是特别 optimized。

```java
// Time Complexity O(n)
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {
    List<Integer> list1 = new ArrayList<>(), list2 = new ArrayList<>();
    
    public boolean leafSimilar(TreeNode root1, TreeNode root2) {
        dfs(root1, list1);
        dfs(root2, list2);
        if (list1.size() == list2.size()) {
            for (int i = 0; i < list1.size(); i++) {
                if (list1.get(i) != list2.get(i)) return false;
            }
            return true;
        }
        return false;
    }
    
    TreeNode dfs(TreeNode root, List<Integer> list) {
        if (root == null) return null;
        TreeNode left = dfs(root.left, list);
        TreeNode right = dfs(root.right, list);
        if (left == null && right == null) {
            list.add(root.val);
        }
        return root;
    }
}
```

# 874. Walking Robot Simulation

模拟题感觉没什么好说的，可能按上左下右的顺序存一个 move 数组会比较好模拟转向 (+1 or -1)。

而且由于数据的范围还是比较大的，开一个二维数组存 obstacle 或者每一次都要遍历所有的 obstacles 会分别面临 OOM 和 TLE 的问题。所以我选择用 HashMap 和 HashSet 去存储 obstacle。

**Note:**

1. `0 <= commands.length <= 10000`
2. `0 <= obstacles.length <= 10000`
3. `-30000 <= obstacle[i][0] <= 30000`
4. `-30000 <= obstacle[i][1] <= 30000`
5. The answer is guaranteed to be less than `2 ^ 31`.

```java
// Time Complexity O(nlogn)
class Solution {
    int[][] move = new int[][]{{0, 1}, {-1, 0}, {0, -1}, {1, 0}};
    public int robotSim(int[] commands, int[][] obstacles) {
        int turn = 0;
        int[] cur = new int[]{0, 0};
        Map<Integer, Set<Integer>> map = new HashMap<>();
        int ans = 0;
        for (int[] ob : obstacles) {
            if (!map.containsKey(ob[0])) {
                map.put(ob[0], new HashSet<>());
            }
            map.get(ob[0]).add(ob[1]);
        }
        for (int i = 0; i < commands.length; i++) {
            if (commands[i] == -2) {
                turn = (turn + 1) % move.length;
            } else if (commands[i] == -1) {
                turn = (turn - 1 + move.length) % move.length;
            } else if (1 <= commands[i] && commands[i] <= 9) {
                int[] next = new int[2];
                for (int j = 1; j <= commands[i]; j++) {
                    next[0] = cur[0] + move[turn][0];
                    next[1] = cur[1] + move[turn][1];
                    if (map.containsKey(next[0]) && map.get(next[0]).contains(next[1])) break;
                    cur[0] = next[0];
                    cur[1] = next[1];
                }
            }
            ans = Math.max(ans, cur[0] * cur[0] + cur[1] * cur[1]);
            //System.out.println(cur[0] + " " +  cur[1]);
        }
        
        return ans;
    }
}
```

# 875. Koko Eating Bananas

第三题就是特别典型的二分解并给出一个线性时间的 check 方法的问题了。跟我之前收集的一些[巧用二分的问题](/2018/07/07/%E9%9C%80%E8%A6%81%E8%BD%AC%E6%8D%A2%E6%80%9D%E8%B7%AF%E7%9A%84%E4%B8%80%E4%BA%9B%E9%A2%98%E7%9B%AE/)可以说是非常相似了。

```java
// Time Complexity O(nlogn)
class Solution {
    public int minEatingSpeed(int[] piles, int H) {
        int left = 1, right = 1;
        for (int pile : piles) right = Math.max(right, pile);
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (finish(mid, piles, H)) {
                right = mid-1;
            } else {
                left = mid + 1;
            }
        }
        
        return left;
    }
    
    boolean finish(int k, int[] piles, int H) {
        int n = 0;
        for (int pile : piles) {
            n += pile / k;
            if (pile % k != 0) n++;
        }
        if (n <= H) return true;
        return false;
    }
}
```

# 873. Length of Longest Fibonacci Subsequence

枚举前两位数，一个 Fibonacci 数列就可以确定下来，再用 binary search 去解决是否存在的问题。可以剪枝，我还没来得及想更好的解，不过即使是 `O(n^2logn)` 也是可以 AC 的。

```java
// Time Complexity O(n^2logn)
class Solution {
    public int lenLongestFibSubseq(int[] A) {
        int ans = 0;
        for (int i = 0; i < A.length; i++) {
            for (int j = i+1; j< A.length; j++) {
                int a, b = A[i], c = A[j];
                int count = 2;
                while (true) {
                    a = b;
                    b = c;
                    c = a + b;
                    int index = Arrays.binarySearch(A, j+1, A.length, c);
                    if (index < 0) break;
                    count++;
                    ans = Math.max(ans, count);
                }
            }
        }
        
        return ans;
    }
}
```

