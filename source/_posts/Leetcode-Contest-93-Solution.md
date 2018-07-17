---
title: Leetcode Contest 93 Solution
date: 2018-07-15 10:45:06
tags:
  - Leetcode
  - 总结
categories: 
  - 编程题
---

Link：[https://leetcode.com/contest/weekly-contest-93](https://leetcode.com/contest/weekly-contest-93)

沉迷吃鸡不能自拔...要改！第 1 题 naïve，第 2 题 enumeration，第 3 题 TreeMap + Greedy，第 4 题 PriorityQueue + Greedy。

<!-- more -->

# 869. Reordered Power of 2

这道题直接枚举 N 的 permutation 肯定是超时的。我是枚举 2 的 power 然后给定一个 len(N) 的判定条件，可以通过 2 的 power 的位数剪枝，不剪枝也无所谓。

```java
// Time Complexity O(logn)
class Solution {
    public boolean reorderedPowerOf2(int N) {
        if (N <= 0) return false;
        
        int[] f = calc(N);
        long power = 1;
        
        while (power <= Integer.MAX_VALUE) {
            int[] d = calc((int)power);
            if (Arrays.equals(f,d)) return true;
            if (d[10] > f[10]) return false;
            power <<= 1;
        }
        
        return false;
    }
    
    int[] calc(int N) {
        int[] f = new int[11];
        while (N > 0) {
            f[N % 10]++;
            N /= 10;
            f[10]++;
        }
        return f;
    }
}
```

# 870. Advantage Shuffle

## TreeMap + Greedy

TreeMap saved numbers of A in sorted order. Traverse array B, at each iteration `B[i]`, we want to find the least number which is greater than `B[i]`.

Why is the method optimized?

Because every number in A can only contribute to one advantage or not. Numbers larger than it can contribute to other cases and it is still optimized. Numbers less than it can't make the case as an advantage. 

```java
// Time Complexity O(nlogn)
class Solution {
    public int[] advantageCount(int[] A, int[] B) {
        TreeMap<Integer, Integer> map = new TreeMap<>();
        
        for (int num : A) map.put(num, map.getOrDefault(num, 0)+1);
        List<Integer> index = new ArrayList<>();
        
        for (int i = 0; i < B.length; i++) {
            Integer key = map.ceilingKey(B[i]+1);
            if (key == null) {
                index.add(i);
            } else {
                A[i] = key;
                if (map.get(key) == 1) map.remove(key);
                else map.put(key, map.get(key)-1);
            }
        }
        
        int j = 0;
        for (int key: map.keySet()) {
            for (int i = map.get(key); i > 0; i--) {
                A[index.get(j++)] = key;
            }
        }
        return A;
    }
}
```
# 871. Minimum Number of Refueling Stops

## PriorityQueue + Greedy

这道题给我的第一印象是它特别像一道青蛙 jump 的 dp 题，不过两者还是有点区别。思想都是每次迭代都尽量往右边延伸，直到到达 target，特别符合使用 PriorityQueue 的场景！

从 startFuel 开始，将路过的加油站的油量存入 PriorityQueue，因为 1 fuel = 1 mile，step is discrete，我们不用考虑经过的加油站不能使用的情景，所有的加油站都可以任意停靠。每次取最大的油量加油，更新 PriorityQueue，直到到达 target 或 PriorityQueue 为空。

```java
// Time Complexity O(nlogn)
class Solution {
    public int minRefuelStops(int target, int startFuel, int[][] stations) {
        if (startFuel >= target) return 0;
    
        int index = 0, ans = 0;
        PriorityQueue<Integer> q = new PriorityQueue<>((a,b)->Integer.compare(b,a));
        for (;index < stations.length && stations[index][0] <= startFuel; index++) {            
            q.offer(stations[index][1]);
        }
        while (!q.isEmpty()) {
            startFuel += q.poll();
            ans++;
            if (startFuel >= target) return ans;
            for (;index < stations.length && stations[index][0] <= startFuel; index++) {            
                q.offer(stations[index][1]);
            }
        }
        
        return -1;        
    }
}
```

