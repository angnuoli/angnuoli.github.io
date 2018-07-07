---
title: Leetcode Contest 79 Solution
date: 2018-04-07 23:50:43
tags: 
  - Leetcode
  - 总结
categories: 
  - 编程题
---

Link：[https://leetcode.com/contest/weekly-contest-79](https://leetcode.com/contest/weekly-contest-79)

Problems are not hard this week. Problem 1 is math, prob 2 is dfs, prob 3 is dp and prob 4 is bfs。

<!-- more -->

# 812. Largest Triangle Area

You have a list of points in the plane. Return the area of the largest triangle that can be formed by any 3 of the points.

```
Example:
Input: points = [[0,0],[0,1],[1,0],[0,2],[2,0]]
Output: 2
Explanation: 
The five points are show in the figure below. The red triangle is the largest.
```

**Notes:**

- `3 <= points.length <= 50`.
- No points will be duplicated.
-  `-50 <= points[i][j] <= 50`.
- Answers within `10^-6` of the true value will be accepted as correct.

## Brute force

Because of the number of points is small, brute force is fast enough to solve this problem.

We can use [Shoelace formula](https://en.wikipedia.org/wiki/Shoelace_formula) to determine the area of the triangle.
$$
\begin{align}
\mathbf{A}&=\frac{1}{2} 
\left|\begin{array}{cccc}   
    1 &    1    & 1 \\   
    x_1 &   x_2   & x_3\\   
    y_1 & y_2 & y_3  
\end{array}\right|  \\
&= \frac{1}{2}|x_1y_2 + x_2y_3 + x_3y_1 - x_2y_1-x_3y_2 - x_1y_3|
\end{align}
$$

```java
// Time Complexity O(n^3)
class Solution {
    public double largestTriangleArea(int[][] points) {
        double area = 0;
        for (int[] i : points) {
            for (int j[] : points) {
                for (int[] k : points) {
                    area = Math.max(area, 0.5 * Math.abs(i[0]*(j[1] - k[1]) 
                                                         + j[0]*(k[1] - i[1])
                                                         + k[0]*(i[1] - j[1])));
                }
            }
        }
        return area;
    }
}
```
# 814. Binary Tree Pruning

Given a binary tree, where additionally every node's value is either a 0 or a 1.

Return the same tree where every subtree (of the given tree) not containing a 1 has been removed.

(Recall that the subtree of a node X is X, plus every node that is a descendant of X.)

```
Example 1:
Input: [1,null,0,0,1]
Output: [1,null,0,null,1]
 
Explanation: 
Only the red nodes satisfy the property "every subtree not containing a 1".
The diagram on the right represents the answer.
```

![](https://i.loli.net/2018/04/08/5ac9a3f56a1ef.jpg)

## DFS

Traverse all nodes by DFS, calculate the number of nodes which contains 1 recursively.

For example, go into left subtree and return the number of nodes which contains 1 of left subtree. If the number is 0, just remove the subtree.

Process right subtree in same way. 

Finally return left + right + cur.val == 1.

Check if we should remove the whole tree.

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
    public TreeNode pruneTree(TreeNode root) {
        if (root == null) return root;
        if (helper(root) == 0) root = null;
        return root;
    }
    
    int helper(TreeNode root) {
        if (root == null) return 0;
        int left = helper(root.left);
        if (left == 0) root.left = null;
        int right = helper(root.right);
        if (right == 0) root.right = null;
        return left + right + (root.val & 1);
    }
}
```
# 813. Largest Sum of Averages

We partition a row of numbers `A` into at most `K` adjacent (non-empty) groups, then our score is the sum of the average of each group. What is the largest score we can achieve?

Note that our partition must use every number in A, and that scores are not necessarily integers.

```
Example:
Input: 
A = [9,1,2,3,9]
K = 3
Output: 20
Explanation: 
The best choice is to partition A into [9], [1, 2, 3], [9]. The answer is 9 + (1 + 2 + 3) / 3 + 9 = 20.
We could have also partitioned A into [9, 1], [2], [3, 9], for example.
That partition would lead to a score of 5 + 2 + 6 = 13, which is worse.
```

**Note:**

- `1 <= A.length <= 100`.
- `1 <= A[i] <= 10000`.
- `1 <= K <= A.length`.
- Answers within `10^-6` of the correct answer will be accepted as correct.

## DP

More groups we partition, larger score we can get. 

`dp[i][j] ` represents the largest score we can get where we partition A[0..i] into j groups.

The recurrence relation is `dp[i][j] = max{dp[l][j-1] + avg(A[l+1]..A[i])}` , which enums the kth group which contains `A[l] ~ A[i]` .

```java
// Time Complexity O(n^2 * K)
class Solution {
    public double largestSumOfAverages(int[] A, int K) {
        double[][] dp = new double[A.length][K+1];
        double sum[] = new double[A.length+1];

        for (int i = 0; i < A.length; i++) {
            sum[i+1] = sum[i] + A[i];
            dp[i][1] = sum[i+1] / (i+1);
            for (int j = 2; j <= K; j++) {
                for (int l = i; l >= j - 1; l--) {
                    dp[i][j] = Math.max(dp[i][j], dp[l-1][j-1] + (sum[i+1] - sum[l]) / (double)(i-l+1));
                }
            }
        }

        return dp[A.length-1][K];
    }
}
```
# 815. Bus Routes

We have a list of bus routes. Each `routes[i]` is a bus route that the i-th bus repeats forever. For example if `routes[0] = [1, 5, 7]`, this means that the first bus (0-th indexed) travels in the sequence 1->5->7->1->5->7->1->... forever.

We start at bus stop `S` (initially not on a bus), and we want to go to bus stop `T`. Travelling by buses only, what is the least number of buses we must take to reach our destination? Return -1 if it is not possible.

```
Example:
Input: 
routes = [[1, 2, 7], [3, 6, 7]]
S = 1
T = 6
Output: 2
Explanation: 
The best strategy is take the first bus to the bus stop 7, then take the second bus to the bus stop 6.
```

**Note:**

- `1 <= routes.length <= 500`.
- `1 <= routes[i].length <= 500`.
- `0 <= routes[i][j] < 10 ^ 6`.

## BFS

Finding the path of least steps is usually connected with BFS. 

Each bus is a node. 

- It has a set of bus nodes which it can reach.

-  It has a set of stops.

First we traverse all routes and construct an edge between bus i and bus j if they have a same stop (store in `Set<Node> nextBus`).

Then we can use typically bfs method to go through all bus nodes which can be reached from stop S.

We don't need to process a bus node which has been met before.

```java
// Time Complexity O(routes + len(buses))
class Solution {
    boolean[] bus = new boolean[600];
    
    class Node{
        int bus;
        int dis;
        Node(int bus, int dis) {
            this.bus = bus;
            this.dis = dis;
        }
    }
    class Bus{
        Set<Integer> nextBus = new HashSet<>();
        Set<Integer> routes = new HashSet<>();
    }
    
    public int numBusesToDestination(int[][] routes, int S, int T) {
        if (S == T) return 0;
        
        Bus[] buses = new Bus[routes.length];   
        Map<Integer, Set<Integer>> map = new HashMap<>();
        for (int i = 0; i < routes.length; i++) {
            buses[i] = new Bus();
            for (int j : routes[i]) {
                buses[i].routes.add(j);
                if (map.containsKey(j)) {
                    map.get(j).add(i);
                } else {
                    Set<Integer> set = new HashSet<>();
                    set.add(i);
                    map.put(j, set);
                }
            }
        }    
        
        for (int i = 0; i < routes.length; i++) {
            for (int j : routes[i]) {
                buses[i].nextBus.addAll(map.get(j));
            }
        } 
        
        Queue<Node> q = new LinkedList<>();
        if (map.containsKey(S)) {
            for (int i : map.get(S)) {
                Node node = new Node(i, 1);
                q.offer(node);
                bus[i] = true;
            }
        }
        
        while (!q.isEmpty()) {
            Node node = q.poll();
            if (buses[node.bus].routes.contains(T)) return node.dis;
            for (int i : buses[node.bus].nextBus) {
                if (!bus[i]) {
                    q.offer(new Node(i, node.dis+1));
                    bus[i] = true;
                }
            }
        }
        return -1;
    }
}
```