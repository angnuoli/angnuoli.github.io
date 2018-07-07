---
title: 关于二分的一些思考
date: 2018-04-09 17:48:43
tags:
  - Leetcode
  - 二分
  - 趣题
categories:
  - 编程题
---

最近碰上了一些有意思的二分查找的题目，让我对自己原来关于二分查找的认识进行了一定程度的自省，也让我有种眼前一亮的感觉，正好记录一下。

题目可以概括为，在非有序序列中进行查找。

# 162. Find Peak Element

A peak element is an element that is greater than its neighbors.

Given an input array where `num[i] ≠ num[i+1]`, find a peak element and return its index.

The array may contain multiple peaks, in that case return the index to any one of the peaks is fine.

You may imagine that `num[-1] = num[n] = -∞`.

```
Example:
Input: [1, 2, 3, 1]
Output: 2
Explanation: 
For example, in array [1, 2, 3, 1], 3 is a peak element and your function should return the index number 2.
```

<!-- more -->

## Traverse

我第一眼看上去，扫一遍数组，依次 check `num[i] > num[i+1]` ，如果满足一个就可以输出 i ；全部不满足，即升序序列，那么输出数组的最后一个即可，因为 `num[n-1] > num[n] = -∞` 。时间复杂度 O(n)。

```java
class Solution {
    public int findPeakElement(int[] nums) {
        for (int i = 0; i < nums.length - 1; i++) {
            if (nums[i] > nums[i+1]) {
                return i;
            }
        }
        return nums.length-1;
    }
}
```

## Binary Search

很快用第一种写法 A 了，回头再看这题能否优化。线性时间再优化就是 logn 级别的时间复杂度，O(n) -> O(logn)，一般就是树或二分查找，所以我也很自然地往二分上去想了。

但是，这个序列并不是一个有序序列，能用二分吗？我开始也觉得没思路（discuss 里面有暴躁老哥直接说, "This may be stupid question… How can you do binary search on an array which is not sorted?"，笑死我了🤣）。不过，他的确说到点子上了，我们一般遇见的二分查找大多是在有序序列中是用的，非有序序列的情况下如何二分？

然而，二分查找真的要求序列有序吗？回想一下二分查找算法 —— 其核心是通过和中间点比较得到的信息，推断出我们要查找的数在 `[left, mid)` 还是 `(mid, right]` 区间中，或者就是 mid 本身。好像并没有要求序列有序！只要中间点能给予我们一些信息让我们将搜索空间缩小一半，即是二分（之前我也拘泥于序列必须有序，反而忘记了算法最根本的目的，缩小搜索空间）。

先看看二分能提供给我们什么信息，首先取中间点 mid，那么我们同样能够得到 mid 和其 neighbors 之间的关系，如果 num[mid] is peak，直接返回 mid 即可；如果 mid 不是 peak，那么 mid 和其 neighbors 组成的三元组必然是升序或降序序列，结合我们找的是 peak，那么我们可以合理推断，升序的那一侧必然存在 peak。

这样，这个问题也就完全转变成了一个典型的二分查找，注意处理一下两个边界，时间复杂度 O(logn）。

```JAVA
class Solution {
    public int findPeakElement(int[] nums) {
        int left = 0, right = nums.length - 1;
        int n = nums.length;
        
        while (left <= right) {
            int mid = (left + right) / 2;
            
            if ((mid==0 || nums[mid] > nums[mid-1]) && (mid == n-1 || nums[mid] > nums[mid+1])) return mid;
            if ((mid == 0 || nums[mid-1] < nums[mid]) && (mid != n-1 && nums[mid] < nums[mid+1])) {
                left = mid+1;
            } else {
                right = mid-1;
            }
        }
        return right;
    }
    
}
```

# 在先升后降序列中查找

给定一个序列 `arr = [1,2,3,4,5,6,4,3,2,1]` , 先升后降，在其中查找一个数 `num` 。

一般，如果是在一个升序序列或降序序列中查找数，我们很容易想到二分。但是如果突然出现先升后降或先降后升的变体呢？

同样的思路，找中点，利用 `arr[mid-1], arr[mid], arr[mid+1]` 三者之间的顺序来确定哪部分空间是需要继续搜索的，哪部分空间是可以剪枝的。

二分查找对有序性的要求其实是可以弱化的，我感觉我现在可能更喜欢 `divide and conquer` 这种说法吧。其实，二分本来就来源于此，只不过题目见得多了反而使人产生了惯性思维。所以，增加自己对于算法一些基本思想的认识，而不是仅仅流于算法形式会比较好。

最后贴上代码

```java
class Solution {
    public int findIndex(int num, int[] arr) {
        return findIndex(num, arr, 0, arr.length - 1);
    }

    int findIndex(int num, int[] arr, int left, int right) {
        // edge case
        if (left > right) return -1;
        if (left == right) {
            if (arr[left] == num) return left;
            return -1;
        }
        if (left == right - 1) {
            if (arr[left] == num) return left;
            if (arr[right] == num) return right;
            return -1;
        }

        int mid = left + (right - left) / 2;
        if (arr[mid] == num) return mid;

        int index = -1;
        if (arr[mid] > num) {
            index = findIndex(num, arr, left, mid - 1);
            if (index != -1) return index;
            index = findIndex(num, arr, mid + 1, right);
        } else {
            // arr[mid] < num 两边不要
            if (arr[mid - 1] < arr[mid] && arr[mid] < arr[mid + 1]) {
                index = findIndex(num, arr, mid + 1, right);
            } else if (arr[mid - 1] > arr[mid] && arr[mid] > arr[mid + 1]) { // right decreasing
                index = findIndex(num, arr, left, mid - 1);
            }
        }

        return index;
    }
}
```

