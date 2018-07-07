---
title: Leetcode Contest 91 Solution
date: 2018-07-07 14:29:04
tags:
  - Leetcode
  - 总结
categories: 
  - 编程题
---

Link：[https://leetcode.com/contest/weekly-contest-91](https://leetcode.com/contest/weekly-contest-91)

偷懒了一周... 第 1 题 naïve，第 2 题边反转 + dfs，第 3 题没做出来，我觉得贪心的方法不太好证明其最优性，第 4 题 TreeMap $O(n\log^2n)$ or Deque $O(n)$。

<!-- more -->

# 863. All Nodes Distance K in Binary Tree

1. 判断一下 K 是否为0，边界条件
2. 先将 target 的所有 children 遍历一遍，找出 distance 为 K 的节点。将 target 的左右分支砍掉，因为这边不再对答案有贡献。
3. 接下来，我们只要将 root 到 target 这条路径上的 edge 全部反转成 child 指向 father。
4. 再调用一次 dfs 遍历 target 的子节点。

```java
// Time Complexity O(N), Space Complexity O(1)
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
    List<Integer> ans = new ArrayList<>();
    
    public List<Integer> distanceK(TreeNode root, TreeNode target, int K) {
        if (K == 0) {
            ans.add(target.val);
            return ans;
        }        
        dfs(0, target, K);
        target.left = target.right = null;
        dfs1(root, null, target);
        dfs(0, target, K);        
        return ans;
    }
    
    void dfs(int dep, TreeNode root, int K) {
        if (root == null) return;
        if (dep == K) {
            ans.add(root.val);
            return;
        }        
        dfs(dep+1, root.left, K);
        dfs(dep+1, root.right, K);
    }
    
    boolean dfs1(TreeNode root, TreeNode father, TreeNode target) {
        if (root == null) return false;
        if (root == target) {
            root.right = father;
            return true;
        }
        if (dfs1(root.left, root, target)) {
            root.left = father;
            return true;
        } else if (dfs1(root.right, root, target)) {
            root.right = father;
            return true;
        }
        return false;
    }
}
```

# 862. Shortest Subarray with Sum at Least K

## Deque

我一直觉得 Deque 和二分一直是解题中两个比较美妙的解法，两者分别有着 O(n) 和 O(logn) 的潜力。

这道题可以用 Deque 做。

设数组 `B[i]` 存储的是 `1 ~ i` 的子序和，`Deque<Integer> q` 保存的是一个 index 序列，使得 `B[q[j]] < B[q[k]] if j < k in q`。

当我们遍历到 `i` 时，求得 `B[i]` ，从 Deque 的 tail 处往前遍历，如果 `B[q[tail]] > B[i]`，那么之后的任意一段子数组和 `K <= B[j] - B[q[tail]] < B[j] - B[i]` ，即 `q[tail] ~ j` 的解不会优于当前解` i ~ j`，所以可以放心的将其弹出。

再从 Deque 的头部往后遍历，如果当前 `B[i] - B[q[front]] >= K` 满足解的条件，那么对之后任意 `j > i` 其子数组的长度都不会比 `i - q[front]` 短，所以我们也可以放心地将其弹出。

所有的元素只会进入一次 Deque 并被弹出一次，所以时间复杂度为 O(n)。  

```java
// Time Complexity O(N), Space O(N)
class Solution {
    public int shortestSubarray(int[] A, int K) {
        int[] B = new int[A.length+1];
        Deque<Integer> q = new LinkedList<>();
        
        int ans = -1;
        q.offer(0);
        for (int i = 1; i <= A.length; i++) {
            B[i] = B[i-1] + A[i-1];
            while (!q.isEmpty() && B[q.peekLast()] >= B[i]) {
                q.pollLast();
            }        
            q.offer(i);
            while (!q.isEmpty() && (B[i] - B[q.peekFirst()] >= K)) {
                int j = q.pollFirst();
                if (ans == -1) ans = i-j;
                else ans = Math.min(ans, i-j);
            }
            //System.out.println(q);
        }
        
        return ans;
    }
}
```

## TreeMap

TreeMap 的解法和 Deque 的思想是一致的，但是它需要维护 logn 的插入和 logn 的寻找弹出。其他的倒是没什么不同。

```java
// Time Complexity O(Nlognlogn)
class Solution {
    public int shortestSubarray(int[] A, int K) {
        int ans = Integer.MAX_VALUE;
        TreeMap<Integer, Integer> map = new TreeMap<>();
        int sum = 0;
        map.put(0, -1);
        for (int i = 0; i < A.length; i++) {
            sum += A[i];
            Integer sub = map.floorKey(sum - K);
            while (sub != null) {
                ans = Math.min(ans, i - map.get(sub));
                map.remove(sub);
                sub = map.floorKey(sub);
            }
            map.put(sum, i);
        }
        
        return ans == Integer.MAX_VALUE ? -1 : ans;
    }
}
```