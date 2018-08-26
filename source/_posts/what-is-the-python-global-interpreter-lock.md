---
title: 什么是 Python 全局解释器锁（GIL）？
tags:
  - Python
abbrlink: 8f220a66
date: 2018-08-26 20:59:16
---

本文翻译自 [What is the Python Global Interpreter Lock (GIL)?](https://realpython.com/python-gil/)

自豪的采用搜狗翻译。

## 写在前面

简单地说，Python 全局解释器锁 [GIL](https://wiki.python.org/moin/GlobalInterpreterLock) 是一个互斥锁，只允许一个线程控制 Python 解释器。

这意味着在任何时间点，只有一个线程可以处于执行状态。执行单线程程序的开发人员看不到 GIL 的影响，但是它可能会成为 CPU 密集和多线程代码的性能瓶颈。

即使在具有多个 CPU 内核的多线程体系结构中，GIL 一次也只允许一个线程执行，由此 GIL 也获得了 Python “臭名昭著” 特性的声誉。

在本文中，您将了解 GIL 如何影响 Python 程序的性能，以及如何减轻它对代码的影响。

## GIL 为 Python 解决了什么问题？

Python 使用引用计数进行内存管理。这意味着在 Python 中创建的对象有一个引用计数变量，该变量跟踪指向该对象的引用数量。当这个计数达到零时，对象占用的内存被释放。

让我们来看一个简短的代码示例，它演示了引用计数是如何工作的：

```python
>>> import sys
>>> a = []
>>> b = a
>>> sys.getrefcount(a)
3
```

在上例中，空列表对象 `[]` 的引用计数为 3。列表对象被 `a`、`b` 和传递给 `sys.getrefcount()` 的参数引用。

回到 GIL：

问题是这个引用计数变量需要保护，以避免两个线程同时增加或减少其值的竞争情况。如果发生这种情况，可能会导致泄漏的内存永远不会释放，或者更糟的是，在对该对象的引用仍然存在的情况下，错误地释放内存。这可能会导致 Python 程序崩溃或其他“奇怪”的错误。

这个引用计数变量可以通过向线程间共享的所有数据结构添加锁来保持安全，这样它们不会被不一致地修改。

但是向每个对象或对象组添加一个锁意味着将存在多个锁，这可能会导致另一个问题——死锁（只有存在多个锁时才会发生死锁）。另一个副作用是反复获取和释放锁会降低性能。

GIL 是解释器本身的一个锁，它增加了一条规则，即任何 Python 字节码的执行都需要获取解释器锁。这可以防止死锁（因为只有一个锁），并且不会带来太多的性能开销。但是它有效地使得任何 CPU 密集的 Python 程序都是单线程的。

GIL 虽然被用于其他语言的解释器，如 Ruby，但并不是这个问题的唯一解决方案。一些语言通过使用引用计数以外的方法，例如垃圾收集，避免了 GIL 对线程安全内存管理的要求。

另一方面，这意味着这些语言通常必须通过添加其他性能提升特性，如 JIT 编译器来弥补 GIL 单线程性能优势的损失。

## 为什么选择 GIL 作为解决方案？

那么，为什么 Python 中使用了一种看似是阻碍的方法呢？这是 Python 开发人员的错误决定吗？

用[ Larry Hastings 的话](https://youtu.be/KVKufdTphKs?t=12m11s)来说，GIL 的设计决定是 Python 今天如此受欢迎的原因之一。

Python 从操作系统没有线程概念的时候就已经存在了。Python 被设计为易于使用，以便使开发更快，使用它的开发人员更多。

许多扩展是为现有的 C 库编写的，Python 需要这些库的特性。为了防止不一致的变化，这些 C 扩展需要 GIL 提供的线程安全内存管理。

GIL 易于实现，很容易添加到 Python 中。它为单线程程序提供了性能提升，因为只需要管理一个锁。

不是线程安全的库变得更容易集成。这些 C 扩展成为 Python 易于被不同社区采用的原因之一。

正如你所见，GIL 是 CPython 开发人员在 Python 早期面临的一个难题的实用解决方案。

## 对多线程 Python 程序的影响

当你看一个典型的 Python 程序——或者任何计算机程序——时，在性能上受 CPU 限制的程序和受 I / O 限制的程序是有区别的。

CPU 密集的程序是那些将 CPU 推向极限的程序。这包括进行数学计算的程序，如矩阵乘法、搜索、图像处理等。

I / O 密集的程序是那些花费时间等待来自用户、文件、数据库、网络等的输入 / 输出的程序。I / O 密集程序有时不得不等待相当长的时间，直到它们从源获得它们需要的东西，这是因为在输入 / 输出准备好之前，源可能需要做它自己的处理，例如，用户在考虑输入什么到输入框或在程序自己的进程中运行数据库查询。

让我们来看看一个简单的 CPU 密集程序，它执行倒计时：

```python
# single_threaded.py
import time
from threading import Thread

COUNT = 50000000


def countdown(n):
    while n > 0:
        n -= 1


start = time.time()
countdown(COUNT)
end = time.time()

print("Time taken in seconds -", end - start)
```

在我的系统上（4 核）运行此代码，得到以下输出：

```shell
$ python single_threaded.py
Time taken in seconds - 6.20024037361145
```

现在我修改了代码，使用两个线程并行进行相同的倒计时：

```python
# multi_threaded.py
import time
from threading import Thread

COUNT = 50000000


def countdown(n):
    while n > 0:
        n -= 1


t1 = Thread(target=countdown, args=(COUNT // 2,))
t2 = Thread(target=countdown, args=(COUNT // 2,))

start = time.time()
t1.start()
t2.start()
t1.join()
t2.join()
end = time.time()

print("Time taken in seconds -", end - start)
```

当我再次运行它时：

```shell
$ python multi_threaded.py
Time taken in seconds - 6.924342632293701
```

正如你所看到的，两个版本花了几乎相同的时间来完成。在多线程版本中，GIL 阻止了 CPU 密集线程并行执行。

GIL 对 I / O 密集多线程程序的性能没有太大影响，因为线程在等待 I / O 时会共享锁。

但是，线程完全受 CPU 限制的程序，例如，使用线程部分处理图像的程序，由于锁，不仅会变成单线程，而且与被写为完全单线程的情况相比，执行时间也会增加，如上例所示。

这种增加是由于获取和释放锁增加的开销。

## 为什么 GIL 还没有被移除？

Python 的开发人员收到了很多关于这方面的抱怨，但是像 Python 这样流行的语言不会带来像删除 GIL 这样的重要改变而不导致向后不兼容的问题。

很明显，GIL 可以被删除，开发人员和研究人员过去已经多次这样做了，但是所有这些尝试都破坏了现有 C 扩展的兼容性，这些扩展严重依赖于 GIL 提供的解决方案。

当然，对于 GIL 解决的问题还有其他的解决方案，但是其中一些降低了单线程和多线程 I / O 密集程序的性能，另一些则太难了。毕竟，你不想让你现有的 Python 程序在新版本发布后运行得更慢，对吧？

Python 的创建者和 BDFL Guido van Rossum 在 2007 年 9 月的文章 “[移除 GIL 并不容易](https://www.artima.com/weblogs/viewpost.jsp?thread=214235)” 中给了社区一个答案：

> 只有单线程程序（以及多线程但 I / O 密集的程序）的性能没有下降，我才会欢迎一组补丁进入 Py3k。

从那以后的任何尝试都没有满足这个条件。

## 为什么没有在 Python 3 中删除它？

Python 3 确实有机会从头开始许多功能，在这个过程中，它破坏了一些现有 C 扩展的兼容性，这些扩展需要更新和移植更改才能与 Python 3 一起工作。这就是为什么早期版本的 Python 3 被社区采用的速度较慢。

但是为什么 GIL 没有被删除？

移除 GIL 会使 Python 3 在单线程性能上比 Python 2 慢，你可以想象这会导致什么结果。你不能否认 GIL 的单线程性能优势。因此结果是 Python 3 仍然有 GIL。

但是 Python 3 确实给现有的 GIL 带来了重大改进——

我们讨论了 GIL 对 “只有 CPU 密集” 和 “只有 I / O 密集” 多线程程序的影响，但是有些线程是 I / O 密集的，有些线程是 CPU 密集的，那么这些程序呢？

在这样的程序中，众所周知，Python 的 GIL 没有给 I / O 密集线程从 CPU 密集线程中获取 GIL 的机会，从而使 I / O 密集线程无法得到运行机会。

这是因为 Python 中内置的机制迫使线程在一段固定的连续使用时间后释放 GIL，如果没有其他人获得 GIL，同一线程可以继续使用。

```python
>>> import sys
>>> # 间隔被设置为 100 条指令:
>>> sys.getcheckinterval()
100
```

这个机制中的问题是，大多数时候，CPU 密集的线程会在其他线程获取 GIL 之前重新获取 GIL 本身。David Beazley 对此进行了研究，在[这里](http://www.dabeaz.com/blog/2010/01/python-gil-visualized.html)可以找到可视化效果。

Antoine Pitrou 于 2009 年在 Python 3.2 中解决了这个问题，他增加了一个机制，查看其他线程放弃的 GIL 获取请求的数量，并且不允许当前线程在其他线程有机会运行之前重新获取 GIL。

## 如何处理 Python 中的 GIL

如果 GIL 给你带来了问题，这里有几个方法可以尝试：

**多进程 v.s. 多线程：**最流行的方法是使用多进程，使用多个进程而不是线程。每个 Python 进程都有自己的 Python 解释器和内存空间，所以 GIL 不会成为问题。Python 有一个 `multiprocessing` 模块，让我们可以像这样轻松地创建进程：

```python
from multiprocessing import Pool
import time

COUNT = 50000000


def countdown(n):
    while n > 0:
        n -= 1


if __name__ == "__main__":
    pool = Pool(processes=2)
    start = time.time()
    r1 = pool.apply_async(countdown, [COUNT // 2])
    r2 = pool.apply_async(countdown, [COUNT // 2])
    pool.close()
    pool.join()
    end = time.time()
    print("Time taken in seconds -", end - start)
```

在我的系统上运行此命令会产生以下输出：

```shell
$ python multiprocess.py
Time taken in seconds - 4.060242414474487
```

与多线程版本相比，性能显著提高。

时间没有减少到我们上面看到的一半，因为进程管理有它自己的开销。多个进程比多个线程重，因此，请记住这可能会成为扩展瓶颈。

**替代 Python 解释器**：Python 有多个解释器实现。分别用 C、Java、C# 和 Python 编写的 CPython、Jython、IronPython 和 PyPy 是最受欢迎的。GIL 只存在于原始 Python 实现中，即 CPython。如果您的程序及其库可用于其他实现之一，那么您也可以试用它们。

**等等看**：虽然许多 Python 用户都利用了 GIL 的单线程性能优势，但是多线程程序员不必担心，因为 Python 社区中一些最聪明的人正在努力从 CPython 中删除 GIL。其中一个尝试是 [Gilectomy](https://github.com/larryhastings/gilectomy)。

Python GIL 经常被认为是一个神秘而困难的话题。但是请记住，作为一个 Pythonista，只有在编写 C 扩展或者在程序中使用 CPU 密集的多线程时，你才会受到它的影响。

在这种情况下，这篇文章应该会给你所有你需要的东西来理解什么是 GIL 以及如何在你自己的项目中处理它。如果你想了解 GIL 的底层内部工作原理，我建议你看 David Beazley 的演讲[理解 Python GIL](https://youtu.be/Obt-vMVdM8s)。
