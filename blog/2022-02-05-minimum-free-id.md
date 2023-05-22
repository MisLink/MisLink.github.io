---
tags: [算法新解, 算法]
title: 最小可用 id
---

## 什么是最小可用 id？

很多数据都包含 id 这个概念，通常情况下是非负整数，用来唯一标识一条数据。很多 id 处于使用中的状态，也就是已经绑定到一条数据，而另一些 id 处于未使用的状态，可以分配给新的数据。最小可用 id 就是这些数据中最小的可分配 id。

<!--truncate-->

例如，下面是正在使用中的 id：

```
[13, 2, 5, 0, 1, 9, 12, 8, 11, 14]
```

最小可用 id 就是不在这个列表中的最小的非负整数，即 3。

## naïve 的解法

最直观的方法如下：

```python
def brute_force(lst):
  i = 0
  while True:
      if i not in lst:
          return i
      i += 1
```

以上 Python 代码中，`in` 操作是线性的，这意味着上述代码的时间复杂度为 $O(n^2)$。对于 10 万个 id 而言，该程序平均需要 11.5s 才能得到答案。

## 改进一

改进上述解法的关键是：

> 对于 $n$ 个非负整数 $x_1, x_2, ..., x_n$ ，如果存在小于 $n$ 的可用整数，则必然存在某个 $x_i$ 不在 $[0, n)$ 的范围内；否则这些整数必然为 $0, 1, ..., n-1$ 的排列，这时最小的可用整数为 $n$。

于是可以得出如下结论：
在这一结论的基础下，可以使用长度为 n + 1 的数组标记区间 $[0, n]$ 内的某个整数是否可用：

$minFree(x_1, x_2, ..., x_n) \leqslant n$

```python
def min_free(lst):
  n = len(lst)
  flags = [False for i in range(n + 1)]
  for i in lst:
      if i < n:
          flags[i] = True
  for i, f in enumerate(flags):
      if f is False:
          return i
```

该解法由三个步骤组成：

1. 第 3 行，初始化一个值全为 `False` 的标志数组，需要 $O(n)$ 的时间；
2. 第 4 ~ 6 行，遍历列表中的元素，将小于 n 的元素标记为 `True`，需要 $O(n)$ 的时间；
3. 第 7 ~ 9 行，遍历标志数组，返回第一个`False` 值的位置，需要 $O(n)$ 的时间；

每个步骤所需的时间均为 $O(n)$ ，所以该解法的时间复杂度是线性的。

这里用到了 n + 1 个标志，使这个解法无需额外处理就可以适配 `sorted(lst) = [0, 1, ... n - 1]` 的情况。

这个解法的效率比上一个解法高得多：同样对于 10 万个 id，只需要 0.02s 就可以得到答案。

该解法每次都需要申请一个长度为 n + 1 的数组，运行结束后这个数组又被释放掉了。为了对此进行优化，原书提供了对应的 C 语言实现的改进：

1. 预先准备好足够长的数组，然后每次都复用它；
2. 使用二进制位保存标志；

以上改进减少了反复创建和销毁标志数组的时间，也减少了标志数组占据的空间，但是对应的位运算相比之前的布尔数组繁复了很多，在此就不再赘述。

## 改进二

上述的改进以空间上的消耗为代价获得了运行时间上的优化，但是在 n 特别大的情况下，空间上的损耗就不可忽略了。为此，新的改进基于分而治之的方法，将问题分解为若干规模较小的问题，然后逐步解决这些小问题，最终得到结果。

对这个问题应用分治，可以得出如下解法：

> 将所有满足 $x_i \leqslant \lfloor n/2 \rfloor$ 的整数放入序列 $A'$，并将剩余的整数放入另一个序列 $A''$，根据上一个改进得出的结论，如果 $A'$ 的长度正好是 $\lfloor n/2 \rfloor$，这说明 $A'$ 已经“满”了，最小的可用整数一定在 $A''$ 中；否则，最小的可用整数一定在 $A'$ 中。

在很多编程语言中都提供了划分操作：

1. Haskell `Data.List.partition`

```haskell
import Data.List

bsearch :: [Int] -> Int -> Int -> Int
bsearch xs l u | null xs                = l
               | length as == m - l + 1 = bsearch bs (m + 1) u
               | otherwise              = bsearch as l m
 where
  m        = (l + u) `div` 2
  (as, bs) = partition (<= m) xs

minFree :: [Int] -> Int
minFree xs = bsearch xs 0 (length xs - 1)
```

2. Python `列表推导式` 或 `filter`

```python
def min_free(lst, l, u):
    m = (l + u) // 2
    if not lst:
        return l
    left = (i for i in lst if i <= m)
    right = (i for i in lst if i > m)
    if len(left) == m - l + 1:
        return min_free(right, m + 1, u)
    else:
        return min_free(left, l, m)
```

3. C++ `partition`

```cpp
#include <algorithm>
#include <vector>
using namespace std;

int min_free(vector<int>::iterator begin, vector<int>::iterator end, int l, int u) {
  int m = (l + u) / 2;
  if (begin == end) {
    return l;
  }
  auto it = partition(begin, end, [m](int i) { return i <= m; });
  if (it - begin == m - l + 1) {
    return min_free(it, end, m + 1, u);
  } else {
    return min_free(begin, it, l, m);
  }
}
```

上述解法的时间复杂度为 $O(n)$：第一次需要 $O(n)$ 次比较来划分子序列 $A'$ 和 $A''$，第二次需要 $O(n/2)$ 次，第三次需要 $O(n/4)$ 次 ... ，总时间复杂度为 $O(n+n/2+n/4+...) = O(2n) = O(n)$。

该解法不需要使用额外的栈空间保存递归调用，是因为其中的递归调用都是尾递归，在函数式语言中等同于迭代；C++ 可以通过开启优化选项消除尾递归；特别的，Python 不支持尾递归优化。在这种情况下，空间复杂度为递归深度 $O(\lg n)$。为了避免额外的空间占用，可以手工将递归转换为迭代：

```cpp
#include <algorithm>
#include <vector>
using namespace std;

int min_free(vector<int> &lst) {
  int l = 0;
  int u = lst.size() - 1;
  auto begin = lst.begin();
  auto end = lst.end();
  while (end - begin) {
    int m = (l + u) / 2;
    auto left = partition(begin, end, [m](int i) { return i <= m; });
    if (left - begin == m - l + 1) {
      begin = left;
      l = m + 1;
    } else {
      end = left;
      u = m;
    }
  }
  return l;
}
```

这段程序使用了类似快速排序的分割方法，将数组中的元素分为了两部分：所有 left 之前的元素都小于等于 m，所有 left 和 right 之间的元素都大于 m。
