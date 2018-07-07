---
title: Master Java
date: 2018-03-16 13:32:00
tags:
  - Java
categories:
  - Study Notes
---

## 1. 基础

## 1.2. 基本

## 1.3 Java 类间关系

### 1.3.1 Collection - List, Queue, Set

![](https://i.loli.net/2018/03/28/5abb0fc90332f.jpg)

从图中可以看出来，AbstractCollection 主要分为 List，Queue 和 Set 三块。

### 2.1. 字符串常量池

#### 字符串常量池的实现

hashMap 实现。

### 字符串常量池的迁移

在 Java1.7 之后，字符串常量池从 Perm Gen 迁移到了 Heap。

> 这意味着你不用再受固定大小的内存限制。现在所有的字符串像其他普通对象一样被放置到了堆中，这样你调优的时候只需要管理堆的大小。在技术上，仅此一点就有足够的理由让我们重新考虑在java7中使用Strng.intern()。
>
> [-- Java6,7,8中的String.intern() – 字符串常量池](http://www.javaranger.com/archives/1852)

另一篇参考博客：[对于JVM中方法区，永久代，元空间以及字符串常量池的迁移和string.intern方法](http://www.cnblogs.com/hadoop-dev/p/7169252.html)

<!-- more -->

### 2.9. volatile关键字的底层实现原理

参考博客：[就是要你懂Java中volatile关键字实现原理](http://www.cnblogs.com/xrq730/p/7048693.html)

volatile 关键字的作用是保证变量在多线程之间的可见性。

- CPU 缓存

  cache 为了解决 CPU 运算速度和内存读写速度的不一致的问题。当 CPU 调用数据时，这些数据会先存入缓存，然后被 CPU 调用。

- lock 指令

  lock 后的写操作会回写已修改的数据，同时让其它 CPU 相关缓存行失效，从而重新从主存中加载最新的数据。

- 缓存一致性协议，MESI 协议，snooping

  | 状态           | 描述                                                         |
  | -------------- | ------------------------------------------------------------ |
  | M（Modified）  | 这行数据有效，数据被修改了，和内存中的数据不一致，数据只存在于本 Cache 中 |
  | E（Exclusive） | 这行数据有效，数据和内存中的数据一致，数据只存在于本 Cache 中 |
  | S（Shared）    | 这行数据有效，数据和内存中的数据一致，数据存在于很多 Cache 中 |
  | I（Invalid）   | 这行数据无效                                                 |

  1. 只有当缓存行处于 E 或者 M 状态时，处理器才能写它。
  2. 当处理器想写某个缓存行时，如果它没有独占权，它必须先发送一条『我要独占权』的请求给总线，**这会通知其它处理器把它们拥有的同一缓存段的拷贝失效，**因为其它的缓存也在一直在监听总线。
  3. 获得独占权之后，处理器开始修改数据。这时，这个处理器知道，这个缓存行只有一份拷贝，在我自己的缓存中，所以不会有任何冲突。
  4. 如果有其他处理器想读取这个缓存行，独占或已修改的缓存行必须先回到 Shared 状态。如果是已修改的缓存行，那么还要先把内容回写到主存中。



## 2.10. Collections.sort方法使用的是哪种排序方法

1. 先调用对应 Collections 的 sort 方法，如 Collections.sort(list)，会调用 list.sort()。
2. 如果声明使用 merge sort，则使用 merge sort，否则使用 TimSort。

## 2.11. Future接口，常见的线程池中的FutureTask实现等

参考博客：[Java 多线程之Callable、Future以及FutureTask](http://www.sunnyang.com/724.html)

创建线程的两种方式：一种直接继承 Thread 类，另外一种就是实现 Runnable 接口。

- 缺陷：没有返回值；无法抛出任何异常

从JDK1.5开始，又引入了另外一种创建线程的方式，使用Callable和Future或者FutureTask，**Callable接口类似于Runnable，两者都是为那些其实例可能被另一个线程执行的类设计的。但是Runnable不会返回结果，并且无法抛出经过检查的异常。**

## 1.7. 线程池源码

参考博客：[java并发编程学习笔记之线程池等源码小析](http://blog.csdn.net/u010223750/article/details/50488686)

新增一个线程是比较耗资源的，线程池是一种比较合适的处理方法。线程池的三个好处：

1. 降低资源消耗。通过重复利用已创建的线程降低线程创建和销毁造成的消耗。

2. 提高响应速度。当任务到达时，任务可以不需要等到线程创建就能立即执行。

3. 提高线程的可管理性。

（在我看来，是一个 producer-consumer 的模型）

Callable 和 Future 接口。

FutureTask 类实现了 RunnableFuture 接口，RunnableFuture 接口继承自 Runnable、Future 接口。

```java
public interface RunnableFuture<V> extends Runnable, Future<V> {
    /**
     * Sets this Future to the result of its computation
     * unless it has been cancelled.
     */
    void run();
}

public interface Runnable {
    public abstract void run();
}

public interface Future<V> {

    boolean cancel(boolean mayInterruptIfRunning);

    /**
     * Returns {@code true} if this task was cancelled before it completed
     * normally.
     */
    boolean isCancelled();

    /**
     * Returns {@code true} if this task completed.
     */
    boolean isDone();

    /**
     * Waits if necessary for the computation to complete, and then
     * retrieves its result.
     */
    V get() throws InterruptedException, ExecutionException;

    /**
     * Waits if necessary for at most the given time for the computation
     * to complete, and then retrieves its result, if available.
     */
    V get(long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutException;
}

```

Future 接口

- cancel()
  - 如果任务还未 start，任务将 never run
  - 如果任务已经完成， cancel失败
  - If the task has already started, then the {@code mayInterruptIfRunning} parameter determines whether the thread executing this task should be interrupted in an attempt to stop the task.

### FutureTask 的简单例子：

```java
public class ViewFutureTask implements Callable<Integer> {
    private int counter = 0;

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ViewFutureTask testThread = new ViewFutureTask();
        FutureTask<Integer> futureTask = new FutureTask<>(testThread);
        Thread thread = new Thread(futureTask);
        thread.start();
        System.out.printf("future returns: " + futureTask.get());
    }

    @Override
    public Integer call() throws Exception {
        System.out.println("i am running.");
        return 1;
    }
}
```

FutureTask 可以接受 Callable 和 Runnable 对象，但是 FutureTask 会将 Runnable 转化成 Callable 对象。

```java
public FutureTask(Runnable runnable, V result) {
    this.callable = Executors.callable(runnable, result);
    this.state = NEW;       // ensure visibility of callable
}
```

### 线程池的简单用法

```java
public class ViewFutureTask implements Callable<String> {
    int id;

    ViewFutureTask(int id) {
        this.id = id;
    }
    @Override
    public String call() {
        System.out.println("call()方法已被调用！调用 Thread：" + Thread.currentThread().getName());
        return Thread.currentThread().getName() + " 任务返回的结果是： " + id;
    }

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService excutor = Executors.newCachedThreadPool();
        List<Future> resultList = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Callable test = new ViewFutureTask(i);
            // Callable 用 submit，Runnable 用 execute，有无返回值的区别
            Future<Integer> future = excutor.submit(test);

            // Future 的 get 方法是阻塞方法，会等到当前 thread 运行得出结果才能执行，所以难怪之前一直是线性输出。
            // System.out.println(future.get());

            // 改用 List 存储 future 结果
            resultList.add(future);
        }

        // shutdown 看上去也是一个阻塞方法啊
        excutor.shutdown();

        for (Future<String> future: resultList) {
            System.out.println(future.get());
        }
    }
}

Output：
call()方法已被调用！调用 Thread：pool-1-thread-2
call()方法已被调用！调用 Thread：pool-1-thread-8
call()方法已被调用！调用 Thread：pool-1-thread-10
call()方法已被调用！调用 Thread：pool-1-thread-3
call()方法已被调用！调用 Thread：pool-1-thread-4
call()方法已被调用！调用 Thread：pool-1-thread-9
call()方法已被调用！调用 Thread：pool-1-thread-7
call()方法已被调用！调用 Thread：pool-1-thread-5
call()方法已被调用！调用 Thread：pool-1-thread-6
call()方法已被调用！调用 Thread：pool-1-thread-1
pool-1-thread-1 任务返回的结果是： 0
pool-1-thread-2 任务返回的结果是： 1
pool-1-thread-3 任务返回的结果是： 2
pool-1-thread-4 任务返回的结果是： 3
pool-1-thread-5 任务返回的结果是： 4
pool-1-thread-6 任务返回的结果是： 5
pool-1-thread-7 任务返回的结果是： 6
pool-1-thread-8 任务返回的结果是： 7
pool-1-thread-9 任务返回的结果是： 8
pool-1-thread-10 任务返回的结果是： 9
```

从输出中还是很容易看出来多线程的运行过程。

有人做出了一个有趣的实验：

```java
excutor.shutdown();
for (Future<String> future: resultList) {
	System.out.println(future.get());
}

->

for (Future<String> future: resultList) {
	System.out.println(future.get());
}
excutor.shutdown();
```

然后得到了这个结果

![实验结果](https://i.loli.net/2018/03/17/5aac43928acd0.jpg)

很有意思，理论上行得通，但是我反正怎么试也没试出来，留待以后。

### 相关参数

```
corePoolSize is the number of threads to keep in the pool,even if they are idle
```

## 1.5. Java 内存模型以及垃圾回收算法

### 1.5.5. happens-before规则

Java语言有一个 "happens-before" rule，跟 lamport lock 真像。