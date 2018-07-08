---
title: Leetcode Contest 92 Solution
date: 2018-07-08 13:43:55
tags:
  - Leetcode
  - 总结
categories: 
  - 编程题
---

Link：[https://leetcode.com/contest/weekly-contest-92](https://leetcode.com/contest/weekly-contest-92)

第 1 题矩阵转置 naïve，第 2 题 DFS + LCA，第 3 题模拟，第 4 题 BFS + Memory。

<!-- more -->

# 866. Smallest Subtree with all the Deepest Nodes

## DFS + LCA

1. 第一遍 dfs 记录最大深度 $O(n)$。
2. 第二遍 LCA 返回最近公共祖先 $O(n)$。

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
    int maxDep = -1;
    
    public TreeNode subtreeWithAllDeepest(TreeNode root) {
        dfs(root, 0);
        return lca(root, 0);
    }
    
    TreeNode lca(TreeNode root, int dep) {
        if (root == null) return null;
        if (dep == maxDep) {
            return root;
        }
        TreeNode left = lca(root.left, dep+1);
        TreeNode right = lca(root.right, dep+1);
        if (left != null && right != null) {
            return root;
        }
        return left != null ? left : right;
    }
    
    void dfs(TreeNode root, int dep) {
        if (root == null) return;
        if (dep > maxDep) {
            maxDep = dep;            
        }
        dfs(root.left, dep+1);
        dfs(root.right, dep+1);
    } 
}
```

# 867. Prime Palindrome

这道题先 generate palindrome 再判断是否为质数即可。关键点在于实现的细节。

记录一下这次利用数组实现的 palindrome generator。数组存储的是一半的数，从头到尾再从尾到头扫一遍即可生成一个 palindrome，递增可以通过 generator[len-1]+ 1 并进位来实现。

```java
// Time Complexity
class Solution {
    public int primePalindrome(int N) {
        if (N <= 2) return 2;
        
        int n = N, highest = 0;
        int digits = 0;
        
        while (n > 0) {
            digits++;
            highest = n % 10;
            n /= 10;
        }
        
        for (int i = digits; i <= 9; i++, highest = 1) {
            int[] generator = new int[(i+1) / 2];
            generator[0] = highest;
            int p = palindrome(generator, i);

            while (p != -1) {
                if (p >= N && isPrime(p)) return p;
                p = palindrome(generator, i);
            }
        }
        
        return 0;
    }
    
    boolean isPrime(int p) {
        if (p <= 1) return false;
        if (p <= 3) return true;
        
        int sqrt = (int)Math.sqrt(p);
        for (int i = 2; i <= sqrt; i++) {
            if (p % i == 0) return false;
        }
        
        return true;
    }
    
    int palindrome(int[] g, int num) {
        int p = 0;
        if (g[0] == 0) return -1;
        if ((g[0] & 1) == 0) g[0]++;
         
        for (int i = 0; i < g.length; i++) {
            p = p * 10 + g[i];
        }
        for (int i = num - g.length - 1; i >= 0; i--) {
            p = p * 10 + g[i];
        }
        
        int flag = 1;
        for (int i = g.length-1; i >= 0; i--) {
            int c = g[i] + flag;
            g[i] = c % 10;
            flag = c / 10;
        }
        return p;
    }
}
```

# 865. Shortest Path to Get All Keys

## BFS + Memory

这道题简直经典的不行，之前的 contest 我至少见到过两次，每次都是换汤不换药...

**key point：bit 位存储不同的 key 的状态，bfs 找最短路。**

key 有 6 把，nice，一把一个 bit 位，int 就可以表示所有持有 key 的状态，`visited[][][]` 第一维存储 key 的持有状态，后两维存储坐标，然后就是一个标准的 bfs 找最短路径，over。

```java
// Time Complexity O(n*m*2^k)
class Solution {
    class Node {
        int x, y;
        int dis;
        int keys;
        Node(int x, int y, int dis, int keys) {
            this.x = x;
            this.y = y;
            this.keys = keys;
            this.dis = dis;
        }
    }
    
    int[][] move = new int[][]{{0,-1}, {0,1}, {1,0}, {-1, 0}};
    public int shortestPathAllKeys(String[] grid)  {
        int n  = grid.length, m = grid[0].length();
        int key = 0;
        Queue<Node> q = new LinkedList<>();

        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[i].length(); j++) {
                if (Character.isAlphabetic(grid[i].charAt(j))) {
                    key++;
                }
                if (grid[i].charAt(j) == '@') {
                    q.offer(new Node(i, j, 0, 0));
                }
            }
        }
        key /= 2;
        if (key == 0) return 0;
        
        boolean[][][] visited = new boolean[1 << key][n][m];
        visited[0][q.peek().x][q.peek().y] = true;
        
        while (!q.isEmpty()) {
            Node cur = q.poll();
            for (int[] d : move) {
                int dx = d[0] + cur.x, dy = d[1] + cur.y;
                if (dx < 0 || dx >= grid.length || dy < 0 || dy >= grid[0].length()) continue;
                char c = grid[dx].charAt(dy);
                if (c == '#' || ((0 <= c - 'A' && c - 'A' <= 5) && (cur.keys & (1 << (c-'A'))) == 0)) {
                    continue;
                }
                int k = cur.keys;
                if (0 <= c - 'a' && c-'a' <= 5) {
                    k |= 1 << (c-'a');
                }
                if (Integer.bitCount(k) == key) return cur.dis + 1;
               
                if (visited[k][dx][dy]) continue;
                visited[k][dx][dy] = true;
                
                q.offer(new Node(dx, dy, cur.dis+1, k));
            }
        }
        
        return -1;
    }
}
```