---
title: Leetcode Contest 89 Solution
date: 2018-06-23 19:16:43
tags: 
  - Leetcode
  - 总结
categories: 
  - 编程题
---

Link：[https://leetcode.com/contest/weekly-contest-89](https://leetcode.com/contest/weekly-contest-89)

第 1 题二分，我还发了相关的专题，一模一样。第 2 题排序，第 3 题 PriorityQueue + HashMap，第 4 题 BFS。

<!-- more -->

# 852. Peak Index in a Mountain Array

Let's call an array `A` a *mountain* if the following properties hold:

- `A.length >= 3`
- There exists some `0 < i < A.length - 1` such that `A[0] < A[1] < ... A[i-1] < A[i] > A[i+1] > ... > A[A.length - 1]`

Given an array that is definitely a mountain, return any `i` such that `A[0] < A[1] < ... A[i-1] < A[i] > A[i+1] > ... > A[A.length - 1]`.

```
Example 1:
Input: [0,1,0]
Output: 1
```

**Notes:**

- `3 <= A.length <= 10000`
- 0 <= A[i] <= 10^6
- A is a mountain, as defined above.`

## Binary Search

看看数据范围也就知道这道题采用什么时间复杂度的策略了。

```java
// Time Complexity O(logN)
class Solution {
    public int peakIndexInMountainArray(int[] A) {
        int left = 0, right = A.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (A[mid-1] < A[mid] && A[mid] > A[mid+1]) return mid;
            
            if (A[mid-1] < A[mid] && A[mid] < A[mid+1]) {
                left = mid+1;
            } else {
                right = mid-1;
            }
        }
        
        return right;
    }
}
```

# 853. Car Fleet

## Math

第二题倒更像一个数学题，按位置排好序（小 -> 大），从后往前遍历，每次更新最大所需的时间，如果当前车辆所需时间大于最大时间，则左边车肯定追不上右边的车，carFleet++。时间用 double 表示。

```java
// Time Complexity O(NlogN)
class Solution {
    class Car {
        int pos, speed;
        Car(int pos, int speed) {
            this.pos = pos;
            this.speed = speed;
        }
    }
    
    public int carFleet(int target, int[] position, int[] speed) {
        int n = position.length;
        
        if (n == 0) return 0;
        Car[] cars = new Car[n];
        
        for(int i = 0; i < n; i++) {
            cars[i] = new Car(position[i], speed[i]);
        }
        
        Arrays.sort(cars, (a, b) -> Integer.compare(a.pos, b.pos));
        
        double max_time = 0;
        int ans = 0;
        for (int i = n-1; i >= 0; i--) {
            double time = calcTime(cars[i], target);
            
            System.out.println(time);
            
            if (time > max_time) {
                max_time = time;
                ans++;
            }
        }
        
        return ans;
    }
    
    double calcTime(Car car, int target) {
        
        return (double)(target - car.pos) / car.speed;
    }
}
```

# 855. Exam Room: PriorityQueue + HashMap

这道题还是很有意思的，将每两个相邻的人之间看做一条边，每次肯定是取最大的边安排人坐进去，如果多条边相等，那么按照坐的位置从小到大排列。

由于每次要求取最大间距的一条边（注意一下两边的 edge case），很容易想到 PriorityQueue，稍微麻烦的地方在于人离开时如何更新 PriorityQueue。我这里采用的是 HashMap 保存坐的人两边的邻居的 index，如果当前位置有人坐，或者取出来的边保存的两个邻居已经有人离开了，那么这条边就可以判断是 invalid edge，从而达到 lazy delete edge from PriorityQueue 的效果。

```java
// Time Complexity seat: O(logN) leave: O(logN)
class ExamRoom {
    
    class Interval {
        int start, end;
        int dis;
        int seat;
        Interval(int start, int end, int dis, int seat) {
            this.start = start;
            this.end = end;
            this.dis = dis;
            this.seat = seat;
        }
    }
    
    PriorityQueue<Interval> q = new PriorityQueue<>(new Comparator<Interval>(){
        public int compare(Interval a, Interval b) {
            if (a.dis == b.dis) return Integer.compare(a.seat, b.seat);
            return Integer.compare(b.dis, a.dis);
        }
    });
    
    Map<Integer, int[]> map = new HashMap<>();
    int N;

    public ExamRoom(int N) {
        int dis = N;
        int seat = 0;
        this.N = N;
        q.offer(new Interval(-1, N, N, 0));
        map.put(-1, new int[]{-1, N});
        map.put(N, new int[]{-1, N});
    }
    
    public int seat() {
        while(!map.containsKey(q.peek().start) || !map.containsKey(q.peek().end) || map.containsKey(q.peek().seat)) {
            q.poll();
        }
        
        Interval cur = q.poll();
        
        if (cur.start == -1 && cur.end == N) {
            q.offer(new Interval(0, N, N-1, N-1));
        } else if (cur.start == -1) {
            q.offer(new Interval(cur.seat, cur.end, (cur.end - cur.seat)/2, (cur.seat + cur.end)/2));
        } else if (cur.end == N) {
            q.offer(new Interval(cur.start, cur.seat, (cur.seat - cur.start)/2, (cur.seat + cur.start)/2));
        } else {
            q.offer(new Interval(cur.start, cur.seat, (cur.seat - cur.start)/2, (cur.seat + cur.start)/2));
            q.offer(new Interval(cur.seat, cur.end, (cur.end - cur.seat)/2, (cur.seat + cur.end)/2));
        }
        
        map.put(cur.seat, new int[]{cur.start, cur.end});
        map.get(cur.start)[1] = cur.seat;
        map.get(cur.end)[0] = cur.seat;
        return cur.seat;
    }
    
    public void leave(int p) {
        int[] neigh = map.remove(p);
        
        if (neigh[0] == -1 && neigh[1] == N) {
            q.offer(new Interval(-1, N, N, 0));
        } else if (neigh[0] == -1) {
            q.offer(new Interval(neigh[0], neigh[1], neigh[1], 0));
        } else if (neigh[1] == N) {
            q.offer(new Interval(neigh[0], neigh[1], N-1 - neigh[0], N-1));
        } else {
            q.offer(new Interval(neigh[0], neigh[1], (neigh[1]-neigh[0])/2, (neigh[0]+neigh[1])/2));
        }
        map.get(neigh[0])[1] = neigh[1];
        map.get(neigh[1])[0] = neigh[0];
    }
}

/**
 * Your ExamRoom object will be instantiated and called as such:
 * ExamRoom obj = new ExamRoom(N);
 * int param_1 = obj.seat();
 * obj.leave(p);
 */
```

# 854. K-Similar Strings

标准的 BFS + Memory。

