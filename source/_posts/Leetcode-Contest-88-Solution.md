---
title: Leetcode Contest 88 Solution
date: 2018-06-10 15:44:00
tags: 
  - Leetcode
  - 总结
categories: 
  - 编程题
---

Link：[https://leetcode.com/contest/weekly-contest-88](https://leetcode.com/contest/weekly-contest-88)

虽然最近的 contest 都做了，但是由于懒惰，所以都没写 report lol。本周更一发，第 1、2 题模拟题，第 3 题我是采用树的结构求解，第 4 题没做出来...直奔 discuss。

<!-- more -->

# 848. Shifting Letters

We have a string `S` of lowercase letters, and an integer array `shifts`.

Call the *shift* of a letter, the next letter in the alphabet, (wrapping around so that `'z'` becomes `'a'`). 

For example, `shift('a') = 'b'`, `shift('t') = 'u'`, and `shift('z') = 'a'`.

Now for each `shifts[i] = x`, we want to shift the first `i+1` letters of `S`, `x` times.

Return the final string after all such shifts to `S` are applied.

```
Example 1:
Input: S = "abc", shifts = [3,5,9]
Output: "rpl"
Explanation: 
We start with "abc".
After shifting the first 1 letters of S by 3, we have "dbc".
After shifting the first 2 letters of S by 5, we have "igc".
After shifting the first 3 letters of S by 9, we have "rpl", the answer.
```

**Notes:**

- `1 <= S.length = shifts.length <= 20000`
- `0 <= shifts[i] <= 10 ^ 9`

## 模拟

这道题啰嗦了半天，不如直接看 example。大概意思就是一个完成字符串变换，唯一要注意的地方就是 20000 的数据范围，提示我们要在 O(n) 的时间范围内求解，我估计应该没有更快的了。

代码很短，从后往前递推求和，顺便求当前位置的 shift 变换字符即可。

```java
// Time Complexity O(n)
class Solution {
    public String shiftingLetters(String S, int[] shifts) {
        if (S == null || S.length() == 0) return S;
        int n = shifts.length;
        char[] temp = S.toCharArray();
        
        for (int i = n-1; i >= 0; i--) {
            if (i == n-1) {
                shifts[i] = shifts[i] % 26;
            } else {
                shifts[i] = (shifts[i] % 26 + shifts[i+1] % 26) % 26;
            }
            
            temp[i] = (char)((temp[i] - 'a' + shifts[i]) % 26 + 'a');
        }
        
        return new String(temp);
    }
}
```

# 849. Maximize Distance to Closest Person

In a row of `seats`, `1` represents a person sitting in that seat, and `0` represents that the seat is empty. 

There is at least one empty seat, and at least one person sitting.

Alex wants to sit in the seat such that the distance between him and the closest person to him is maximized. 

Return that maximum distance to closest person.

```
Example 2:
Input: [1,0,0,0,1,0,1]
Output: 2
Explanation: 
If Alex sits in the second open seat (seats[2]), then the closest person has distance 2.
If Alex sits in any other open seat, the closest person has distance 1.
Thus, the maximum distance to the closest person is 2.
```

**Note:**

- `1 <= seats.length <= 20000`
- `seats` contains only 0s or 1s, at least one `0`, and at least one `1`.

## One pointer

 一句话总结题意，求相邻两个 1 之间的间距的一半的最大值，注意一下最左边和最右边的 edge case 即可，不难。

```java
// Time Complexity O(n)
class Solution {
    public int maxDistToClosest(int[] seats) {
        if (seats == null || seats.length == 0) return 0;
        
        int ans = 0;
        int lastOne = -1;
        int n = seats.length;
        
        for (int i = 0; i < n; i++) {
            if (seats[i] == 1) {
                if (lastOne == -1) {
                    ans = Math.max(i, ans);
                } else {
                    ans = Math.max((i + lastOne)/2 - lastOne, ans);
                }
                lastOne = i;
            }
        }
        
        ans = Math.max(n - lastOne - 1, ans);
        
        return ans;
    }
}
```

# 851. Loud and Rich

In a group of N people (labelled 0, 1, 2, ..., N-1), each person has different amounts of money, and different levels of quietness.

For convenience, we'll call the person with label x, simply "person x".

We'll say that richer[i] = [x, y] if person x definitely has more money than person y.  Note that richer may only be a subset of valid observations.

Also, we'll say quiet[x] = q if person x has quietness q.

Now, return answer, where answer[x] = y if y is the least quiet person (that is, the person y with the smallest value of quiet[y]), among all people who definitely have equal to or more money than person x.

```
Example 1:
Input: richer = [[1,0],[2,1],[3,1],[3,7],[4,3],[5,3],[6,3]], quiet = [3,2,5,4,6,1,7,0]
Output: [5,5,2,5,4,5,6,7]
Explanation: 
answer[0] = 5.
Person 5 has more money than 3, which has more money than 1, which has more money than 0.
The only person who is quieter (has lower quiet[x]) is person 7, but
it isn't clear if they have more money than person 0.

answer[7] = 7.
Among all people that definitely have equal to or more money than person 7
(which could be persons 3, 4, 5, 6, or 7), the person who is the quietest (has lower quiet[x])
is person 7.

The other answers can be filled out with similar reasoning.
```

**Note:**

- `1 <= quiet.length = N <= 500`
- `0 <= quiet[i] < N`, all `quiet[i]` are different.
- `0 <= richer.length <= N * (N-1) / 2`
- `0 <= richer[i][j] < N`
- `richer[i][0] != richer[i][1]`
- `richer[i]`'s are all different.
- The observations in `richer` are all logically consistent.

## DFS

Build a tree and use list `children` to represents edges which start from a node. The `inDegree[i]` arrays is to store how many in-degree edges connect to the node `i`.

We start DFS at all root nodes. 

- All root nodes must be unvisited and `inDegree[i] = 0`. The node with least quiet value is itself (`answer[i] = i`).
- Traverse its child nodes `j`, update `answer[j]` and `inDegree[j]--`. When `inDegree[j] == 1` , it means there is no edge which will visit node j and  `answer[j]` won't be changed anymore. Now we can broadcast the `answer[j]` to its children. This step can guarantee the time complexity is `max {O(richer.length), O(n)}`. Remember that there is no cycle because the observations are all logically consistent.

```java
// Time Complexity O(n + richer.length)
class Solution {
    class Node{
        List<Integer> children = new ArrayList<>();
    }
    
    int[] answer;
    Node[] nodes;
    int[] inDegree;
    
    public int[] loudAndRich(int[][] richer, int[] quiet) {
        int n = quiet.length;
        inDegree = new int[n];
        nodes = new Node[n];
        answer = new int[n];
        
        for (int i = 0; i < n; i++) {
            nodes[i] = new Node();
            answer[i] = i;
        }
        
        for (int i = 0; i < richer.length; i++) {
            int x = richer[i][0], y = richer[i][1];
            inDegree[y]++;
            nodes[x].children.add(y);
        }
        
        for (int i = 0; i < n; i++) {
            if (inDegree[i] == 0) {
                dfs(i, quiet);
            }
        }
        return answer;
    }
    
    void dfs(int x, int[] quiet) {
        for (int y : nodes[x].children) {
            if (quiet[answer[x]] < quiet[answer[y]]) {
                answer[y] = answer[x];
            }
            if (inDegree[y] == 1) {
                dfs(y, quiet);
            } else {
                inDegree[y]--;
            }
        }
    }
}
```

# 850. Rectangle Area II

We are given a list of (axis-aligned) `rectangles`.  Each `rectangle[i] = [x1, y1, x2, y2] `, where (x1, y1) are the coordinates of the bottom-left corner, and (x2, y2) are the coordinates of the top-right corner of the `i`th rectangle.

Find the total area covered by all `rectangles` in the plane.  Since the answer may be too large, **return it modulo 10^9 + 7**.

![](https://i.loli.net/2018/06/10/5b1ceaab55ec9.jpg)

```
Example 1:
Input: [[0,0,2,2],[1,0,2,3],[1,0,3,1]]
Output: 6
Explanation: As illustrated in the picture.
```

**Note:**

- `1 <= rectangles.length <= 200`
- `rectanges[i].length = 4`
- `0 <= rectangles[i][j] <= 10^9`
- The total area covered by all rectangles will never exceed `2^63 - 1` and thus will fit in a 64-bit signed integer.

## 模拟

看了一下 discuss，大致思路有两类。

- 第一种按纵轴 y 扫一遍，每次求两条 y 边之间的 area 和。
- 第二种是每次读矩阵，用一个 list 存储所有不重叠的矩阵，当新矩阵 r 和 list 中的矩阵重合时，将 list 中的矩阵和 r 重叠的部分拆除，将 list 中的矩阵拆分成多个矩阵（最多4个），然后将 r 存入 list，这种方法的时间惊人的短。

我两种方法都实现了一下，第一种需要 107ms，第二种只需 19ms，理论上两者的时间复杂应该相差不多，可能是因为第一种方法需要用到的容器和 sort 太多了吧。

