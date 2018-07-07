---
title: RecyclerView Bug Report
date: 2018-06-23 16:06:11
tags:
  - Android
  - Bug Report
---

Use notifyItemMoved and notifyDatasetChanged back to back.

在写 drag icon and insert it to RecyclerView 时遇上了一个挺有意思的 bug，记录一下。

# Reproduce Bug

1. 先在 adapter 中更换数据集中两个 item 的位置并调用 notifyItemRangeChanged（场景：drag item 到另一个 position 并显示一个 preview 表示预插入新的 item），preview 处于可视区域内。

2. 短时间内直接更换数据集 (cardItems = newCardItems)，并调用 notifyDataSetChanged （场景：用targetView 替换 preview）。

3. 调用完 notifyDataSetChanged 之后，立即调用 scrollTo 将 RecyclerView 滚动至插入的新 item 处（场景：即时显示新插入的 view）。

	可以不调用 scrollTo，只需保证新的 targetView 仍处于可视区域内（会被 onLayout 刷新）。

4. 结果导致某些 position 在进出可视区域时（比如上下不停来回 scroll RecyclerView）交替显示 preview 和targetView。

# Root cause: preview 先被 remove 后被 add，顺序颠倒了

<!--more-->

不可视范围内的 item 如果被 onCreateViewHolder 加载过，那么它们将存储在 mCachedViews 中（如果数量未超过缓存上限）。

可视范围内的 item 未被缓存，直接保存在 ViewGroup 的 mChildren 数组中。

requestLayout()，正常的布局会 call 

```flow
op1=>operation: onLayout
dispatchLayoutStep1=>operation: dispatchLayoutStep1
processAdapterUpdatesAndSetAnimationFlags=>operation: processAdapterUpdatesAndSetAnimationFlags
op3=>operation: markKnownViewsInvalid
op4=>operation: recycleAndClearCachedViews
op1->dispatchLayoutStep1->processAdapterUpdatesAndSetAnimationFlags->op3->op4
```

remove 所有 mCachedViews 中存储的 views，

```java
* Mark all known views as invalid. Used in response to a, "the whole world might have changed"
* data change event.
```

然后根据对应的 position 重新调用 bindViewHolder 更新可视区域内的 item。一般要么从 RecyclerViewPool 里面随机取一个重置信息，要么 onCreateViewHolder。

**关键问题有两点**：

1. preview 是在何时被 Recycler 回收，存入 mCachedView 的呢？可视区域内的 view 是不会被存入 mCachedViews。
2. 为什么没有被 remove 掉？

原因在于，NotifyItemMoved 会使 RecyclerView 通过 doAnimationFrame 实现移动的动画（drag item 移动的动画）。

```flow
op1=>operation: doAnimationFrame 
op2=>operation: dispatchAnimationFinished
op3=>operation: removeAnimatingView
op4=>operation: recycleViewHolderInternal
op1->op2->op3->op4
```

从上面的调用链可以看出，preview 会在移动的动画完成的时候被回收（很好理解，为之后的移动动画缓存 view）。

两者的正常顺序应该是 2 -> 1，先 add 后 remove，但是如果我们在动画未完成之前就 notifyDataSetChanged，就会在动画未完成之前 call

```flow
op1=>operation: NotifyDataSetChanged 
op2=>operation: onChange
op3=>operation: requestLayout
op4=>operation: scheduleTraversals (ViewRootImpl.java)
op1->op2->op3->op4
```

就这样，顺序变成了 1 -> 2，先 remove 后 add，那么 mCachedViews 里面自然存储了脏数据（preview），但是 1，2 均是在 main thread 上执行的，所以我感觉应该是 post message 执行先后的原因，不太确定是不是一个多线程的问题。

所以 root cause 在于正确的顺序

```flow
op1=>operation: 动画完成 
op2=>operation: add to mCachedViews
op3=>operation: requestLayout
op4=>operation: clear mCachedViews
op5=>operation: onBindViewHolder
op1->op2->op3->op4->op5
```

变为了错误的顺序，由于 adapter 中的数据集已经更新过了，所以 onLayout 布局可视区域时利用的 position 所对应的 view 正好是更新过后的 view。

```flow
op1=>operation: requestLayout
op2=>operation: clear mCachedViews
op3=>operation: onBindViewHolder
op4=>operation: 动画完成
op5=>operation: add to mCachedViews
op1->op2->op3->op4->op5
```

FLAG_ADAPTER_POSITION_UNKNOWN  is not attached。这点发生了，但应该没什么影响。mTags 会在之后被重置（Android 26 直接更改成了 FLAG_INVALID）。

# Scroll 交替出现 preview 和 targetView 的原因

```flow
op1=>operation: addView 
op2=>operation: addViewInt
op1->op2
```

```java
/**
 * Add a view to the currently attached RecyclerView if needed. LayoutManagers should
 * use this method to add views obtained from a {@link Recycler} using
 * {@link Recycler#getViewForPosition(int)}.
 *
 * @param child View to add
 */
public void addView(View child) {
    addView(child, -1);
}
```

每当 RecyclerView 滚动时，不可视的 view 将被 LayoutManager 添加到可视区域 （添加到 mChildren[] 数组），此时调用 addView(View child) 。

```java
/**
 * Add a view to the currently attached RecyclerView if needed. LayoutManagers should
 * use this method to add views obtained from a {@link Recycler} using
 * {@link Recycler#getViewForPosition(int)}.
 *
 * @param child View to add
 */
public void addView(View child) {
    addView(child, -1);
}
```

注释指出，view is obtained from Recycler using Recycler#getViewForPosition(int position)，position 是当前需要添加的 view 的 position (对应 adapter 数据集中的 position)。

在 getViewForPosition(int position) 中

- getChangedScrapViewForPosition 尝试从 Recycler mChangedScrap 取出缓存的 viewHolder
- **getScrapViewForPosition 尝试从 Recycler mAttached mCachedViews 中取出缓存的 viewHolder**
- 如果对应 viewHolder 有稳定的唯一 Id，尝试通过 Id 取出 viewHolder, getScrapViewForId(mAdapter.getItemId(offsetPosition), type, dryRun)
- 如果 mViewCacheExtension 保存了 viewHolder，也可以直接取出来用
- 尝试从 getRecycledViewPool 中取出缓存的 viewHolder（信息需要被重置）
- createrViewHolder() 这里会调用自定义的 onCreateViewHolder

```java
// 关键函数
View getViewForPosition(int position, boolean dryRun) {
    ...
}
```

**交替出现 preview 和正确的targetView 的原因出在第二步 getScrapViewForPosition。**

mCachedViews 是一个 Arraylist，view 从可视区域移出时，会被放在 list 尾部；而 addView 时则是从头循环找对应 position 的 view。

由于同时存储了 preview 和targetView，且两者位置相同，所以两者会交替出现。

具体过程：显示 preview，移除 preview，preview 置于最后，寻找对应 position 的 view，找到targetView，显示，移除，targetView 放到最后。循环往复。

```java
final int cacheSize = mCachedViews.size();
for (int i = 0; i < cacheSize; i++) {
    final ViewHolder holder = mCachedViews.get(i);
    if (!holder.isInvalid() && holder.getLayoutPosition() == position) {
        if (!dryRun) {
            mCachedViews.remove(i);
        }        
        return holder;
    }
}
```

# Magic design

```java
View getViewForPosition(int position, boolean dryRun) {
    ...
    holder = getRecycledViewPool().getRecycledView(type);
    if (holder != null) {
        holder.resetInternal();
        if (FORCE_INVALIDATE_DISPLAY_LIST) {
            invalidateDisplayListInt(holder);
        }
    }
}

```

mCachedViews 移除的 view 会被存储到 RecycledViewPool 中，下次会直接取 pool 中的任意一个 view 并将其内部的信息 reset (mTags 会被置为 0，从而 isBound check 通不过，会调用 bingViewHolder 重新注入正确的信息）。

why？

这样我们就不用重新 new 一个 viewHolder（跳过 onCreateViewHolder，直接进入 onBindViewHolder），像 inflate 这些的重复操作也不必要做了。NB，这里的缓存看的我很服气。

多级缓存

- mCachedView: position 对得上号就直接取用
- mViewCacheExtension: 暂时不知道有什么用，从 view 中取 holder
- RecycledViewPool: scrap 中的 view 的信息需要被重置，但是 R.layout 可以被重新使用而不必再次 inflate，节约资源和时间。