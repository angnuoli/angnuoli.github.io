---
title: Java 序列化
date: 2018-03-14 14:15:34
tags:
  - Java
categories:
  - Study Notes
---

# Java序列化



## [深入学习 Java 序列化](http://www.importnew.com/24490.html)

Java序列化是指把Java对象保存为二进制字节码的过程，Java反序列化是指把二进制码重新转换成Java对象的过程。

在计算需要被序列化的字段的时候会把被static和transient修饰的字段给过滤掉。

## serialVersionUID 与 transient

[java类中serialversionuid作用是什么?举个例子说明](https://www.cnblogs.com/duanxz/p/3511695.html)

<!-- more -->