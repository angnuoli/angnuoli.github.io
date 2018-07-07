---
title: Java 源码阅读——HashMap
date: 2018-03-05 23:11:35
tags:
  - Java 源码
categories:
  - Study Notes
---

# HashMap

java版本为1.8.

## table、bin、node

HashMap通常类似hash table。table包含一系列bin(bucket)，bin容纳nodes。bin即是桶（bucket）ui

```
This map usually acts as a binned (bucketed) hash table, but when bins get 
too large, they are transformed into bins of TreeNodes, each structured 
similarly to those in java.util.TreeMap.
```

### Tree bins

Bins whose elements are all TreeNodes。提供O(logn)的操作。

（以下实力一波嘲讽233

![实力一波嘲讽233](https://i.loli.net/2018/03/25/5ab749f522760.jpg)

<!-- more -->

## capacity

容量，一般为2的幂次方，初始为16，最大为2^30。

```Java
/**
 * The default initial capacity - MUST be a power of two.
 */
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16

/**
 * The maximum capacity, used if a higher value is implicitly specified
 * by either of the constructors with arguments.
 * MUST be a power of two <= 1<<30.
 */
static final int MAXIMUM_CAPACITY = 1 << 30;
```

## threshold

### TREEIFY_THRESHOLD（针对bin存储nodes）

当bin中的nodes数量小于TREEIFY_THRESHOLD，bin中的nodes会以list形式存储；当bin中的node数量超过TREEIFY_THRESHOLD，bin中的nodes会以tree形式存储。

```Java
/**
 * The bin count threshold for using a tree rather than list for a
 * bin.  Bins are converted to trees when adding an element to a
 * bin with at least this many nodes. The value must be greater
 * than 2 and should be at least 8 to mesh with assumptions in
 * tree removal about conversion back to plain bins upon
 * shrinkage.
 */

static final int TREEIFY_THRESHOLD = 8;
```

### UNTREEIFY_THRESHOLD

当bin中的nodes数量重新小于UNTREEIFY_THRESHOLD时，bin中的node会被重新以list形式存储。

```Java
/**
 * The bin count threshold for untreeifying a (split) bin during a
 * resize operation. Should be less than TREEIFY_THRESHOLD, and at
 * most 6 to mesh with shrinkage detection under removal.
 */
static final int UNTREEIFY_THRESHOLD = 6;
```

### MIN_TREEIFY_CAPACITY（针对table存储bins）

当整个table的容量数量小于 MIN_TREEIFY_CAPACITY 时，bins中的 nodes 会以 list 形式存储，如果一个 bin 中过多的 nodes，则直接 resize table 而不是树化（resize 的时候，会将每个 bin 中一半的节点以 index mod N + N 的方法分配到 resize 之后的空 bin 中，一般是直接扩容一倍）；当整个 table 的 nodes 数量大于 MIN_TREEIFY_CAPACITY 时，bins 将会树化。

```Java
/**
 * The smallest table capacity for which bins may be treeified.
 * (Otherwise the table is resized if too many nodes in a bin.)
 * Should be at least 4 * TREEIFY_THRESHOLD to avoid conflicts
 * between resizing and treeification thresholds.
 */
static final int MIN_TREEIFY_CAPACITY = 64;
```

## loadFactor

loadFactor默认是0.75。

```Java
/**
 * The load factor used when none specified in constructor.
 */

static final float DEFAULT_LOAD_FACTOR = 0.75f;
```

## node子类

### equals函数

+ 是否是自己
+ 如果是同Map类实例，key和value对象是否均相同

```Java
public final boolean equals(Object o) {
    if (o == this) // 判断是否为本身
        return true;
    if (o instanceof Map.Entry) { // 是否是Map实例
        Map.Entry<?,?> e = (Map.Entry<?,?>)o;
        if (Objects.equals(key, e.getKey()) &&
            Objects.equals(value, e.getValue()))
            return true;
    }
    return false;
}
```

## hash方法

[Java集合源码阅读之HashMap](https://www.cnblogs.com/tiger-fu/p/7884794.html)

```Java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

## put方法

1. 根据 key 查找对应 bin
2. 如果 bin 为空（无 hash 碰撞），直接插入
3. 如果 bin 不为空（hash 碰撞）。
    - 为链表，尾插法。
        - 插入后 bin 中 nodes 数量大于 thredshold 而 table 容量小于 MIN_TREEIFY_CAPACITY，resize table。
        - 插入后 bin 中 nodes 数量大于 thredshold 而 table 容量大于 MIN_TREEIFY_CAPACITY，转为红黑树存储。
    - 为红黑树，插入树中。

## get方法

## HashMap 继承与实现的接口

```java
public class HashMap<K,V> extends AbstractMap<K,V>
    implements Map<K,V>, Cloneable, Serializable
```

