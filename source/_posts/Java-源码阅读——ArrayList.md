---
title: Java 源码阅读——ArrayList
date: 2018-03-04 23:11:04
tags: 
  - Java 源码
categories:
  - Study Notes
---

# ArrayList源码

```java
transient Object[] elementData; // non-private to simplify nested class access
```

ArrayList的底层实现是一个Object数组，int、char之类的基础类型无法直接add to List。

<!-- more -->

## capacity

### Default capacity

默认capacity是10

```Java
private static final int DEFAULT_CAPACITY = 10;
```

### MAX_ARRAY_SIZE

从grow方法中可以看出最大的Array_size应该是

```
private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;


private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1); // 扩充成原来的1.5倍
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity);
}

private static int hugeCapacity(int minCapacity) {
    if (minCapacity < 0) // overflow
        throw new OutOfMemoryError();
    return (minCapacity > MAX_ARRAY_SIZE) ?
        Integer.MAX_VALUE :
        MAX_ARRAY_SIZE;
}
```

## add

add方法的流程是

1. 保证容量
2. 添加新值

```java
public boolean add(E e) {
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    elementData[size++] = e;
    return true;
}
```

ensureCapacityInternal方法将先判断当前集合是否为空集，因为ArrayList所有空集都是同一个final static对象DEFAULTCAPACITY_EMPTY_ELEMENTDATA。

```java
private void ensureCapacityInternal(int minCapacity) {
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
    }

    ensureExplicitCapacity(minCapacity);
}
```

elementData 数组的容量只会增加不会减少，所以 elementData.length 指向数组的容量，而 size 则指向了数据存储的元素数量。若当前数组容量可以容纳所以存储的元素，那么就没必要调用 grow 方法扩容了。

```java
private void ensureExplicitCapacity(int minCapacity) {
    modCount++;

    // overflow-conscious code
    if (minCapacity - elementData.length > 0)
        grow(minCapacity);
}
```

grow 方法进行扩容，先扩容1.5倍，如果仍然小于所要求的存储空间的大小 minCapacity，那么就将minCapacity 作为新数组的容量。

minCapacity < 0 处理溢出。

```java
private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity);
}

private static int hugeCapacity(int minCapacity) {
    if (minCapacity < 0) // overflow
        throw new OutOfMemoryError();
    return (minCapacity > MAX_ARRAY_SIZE) ?
        Integer.MAX_VALUE :
        MAX_ARRAY_SIZE;
}
```

## contains

```Java
public boolean contains(Object o) {
    return indexOf(o) >= 0;
}

public int indexOf(Object o) {
    if (o == null) {
        for (int i = 0; i < size; i++)
            if (elementData[i]==null)
                return i;
    } else {
        for (int i = 0; i < size; i++)
            if (o.equals(elementData[i]))
                return i;
    }
    return -1;
}
```

contains()方法的时间复杂度是O(n)，从头到尾遍历一遍。

# ArrayList需要注意的点

ArrayList不是线程安全的。

基本上扩容、删除、contains的平均时间复杂度都是O(n), 访问速度是O(1)。

初始容量是10，每次会超出elementData数组容量时，会扩容1.5倍，通过Arrays.copyof()进行实现。所以当我们知道有多少对象要插入的时候尽量用有参构造方法。

```java
public void ensureCapacity(int minCapacity) {
    int minExpand = (elementData != DEFAULTCAPACITY_EMPTY_ELEMENTDATA)
        // any size if not default element table
        ? 0
        // larger than default for default empty table. It's already
        // supposed to be at default size.
        : DEFAULT_CAPACITY;

    if (minCapacity > minExpand) {
        ensureExplicitCapacity(minCapacity);
    }
}
```

modCount 用来判断是否存在多线程的问题，但无法解决问题，只能抛出异常。

```java
final void checkForComodification() {
    if (modCount != expectedModCount)
        throw new ConcurrentModificationException();
}
```
