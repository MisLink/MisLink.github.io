"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[636],{1422:n=>{n.exports=JSON.parse('{"blogPosts":[{"id":"/2022/02/05/minimum-free-id","metadata":{"permalink":"/2022/02/05/minimum-free-id","source":"@site/blog/2022-02-05-minimum-free-id.md","title":"\u6700\u5c0f\u53ef\u7528 id","description":"\u4ec0\u4e48\u662f\u6700\u5c0f\u53ef\u7528 id\uff1f","date":"2022-02-05T00:00:00.000Z","tags":[{"label":"\u7b97\u6cd5\u65b0\u89e3","permalink":"/tags/\u7b97\u6cd5\u65b0\u89e3"},{"label":"\u7b97\u6cd5","permalink":"/tags/\u7b97\u6cd5"}],"readingTime":7.65,"hasTruncateMarker":true,"authors":[],"frontMatter":{"tags":["\u7b97\u6cd5\u65b0\u89e3","\u7b97\u6cd5"],"title":"\u6700\u5c0f\u53ef\u7528 id"},"unlisted":false},"content":"## \u4ec0\u4e48\u662f\u6700\u5c0f\u53ef\u7528 id\uff1f\\n\\n\u5f88\u591a\u6570\u636e\u90fd\u5305\u542b id \u8fd9\u4e2a\u6982\u5ff5\uff0c\u901a\u5e38\u60c5\u51b5\u4e0b\u662f\u975e\u8d1f\u6574\u6570\uff0c\u7528\u6765\u552f\u4e00\u6807\u8bc6\u4e00\u6761\u6570\u636e\u3002\u5f88\u591a id \u5904\u4e8e\u4f7f\u7528\u4e2d\u7684\u72b6\u6001\uff0c\u4e5f\u5c31\u662f\u5df2\u7ecf\u7ed1\u5b9a\u5230\u4e00\u6761\u6570\u636e\uff0c\u800c\u53e6\u4e00\u4e9b id \u5904\u4e8e\u672a\u4f7f\u7528\u7684\u72b6\u6001\uff0c\u53ef\u4ee5\u5206\u914d\u7ed9\u65b0\u7684\u6570\u636e\u3002\u6700\u5c0f\u53ef\u7528 id \u5c31\u662f\u8fd9\u4e9b\u6570\u636e\u4e2d\u6700\u5c0f\u7684\u53ef\u5206\u914d id\u3002\\n\\n\x3c!--truncate--\x3e\\n\\n\u4f8b\u5982\uff0c\u4e0b\u9762\u662f\u6b63\u5728\u4f7f\u7528\u4e2d\u7684 id\uff1a\\n\\n```\\n[13, 2, 5, 0, 1, 9, 12, 8, 11, 14]\\n```\\n\\n\u6700\u5c0f\u53ef\u7528 id \u5c31\u662f\u4e0d\u5728\u8fd9\u4e2a\u5217\u8868\u4e2d\u7684\u6700\u5c0f\u7684\u975e\u8d1f\u6574\u6570\uff0c\u5373 3\u3002\\n\\n## na\xefve \u7684\u89e3\u6cd5\\n\\n\u6700\u76f4\u89c2\u7684\u65b9\u6cd5\u5982\u4e0b\uff1a\\n\\n```python\\ndef brute_force(lst):\\n  i = 0\\n  while True:\\n      if i not in lst:\\n          return i\\n      i += 1\\n```\\n\\n\u4ee5\u4e0a Python \u4ee3\u7801\u4e2d\uff0c`in` \u64cd\u4f5c\u662f\u7ebf\u6027\u7684\uff0c\u8fd9\u610f\u5473\u7740\u4e0a\u8ff0\u4ee3\u7801\u7684\u65f6\u95f4\u590d\u6742\u5ea6\u4e3a $O(n^2)$\u3002\u5bf9\u4e8e 10 \u4e07\u4e2a id \u800c\u8a00\uff0c\u8be5\u7a0b\u5e8f\u5e73\u5747\u9700\u8981 11.5s \u624d\u80fd\u5f97\u5230\u7b54\u6848\u3002\\n\\n## \u6539\u8fdb\u4e00\\n\\n\u6539\u8fdb\u4e0a\u8ff0\u89e3\u6cd5\u7684\u5173\u952e\u662f\uff1a\\n\\n> \u5bf9\u4e8e $n$ \u4e2a\u975e\u8d1f\u6574\u6570 $x_1, x_2, ..., x_n$ \uff0c\u5982\u679c\u5b58\u5728\u5c0f\u4e8e $n$ \u7684\u53ef\u7528\u6574\u6570\uff0c\u5219\u5fc5\u7136\u5b58\u5728\u67d0\u4e2a $x_i$ \u4e0d\u5728 $[0, n)$ \u7684\u8303\u56f4\u5185\uff1b\u5426\u5219\u8fd9\u4e9b\u6574\u6570\u5fc5\u7136\u4e3a $0, 1, ..., n-1$ \u7684\u6392\u5217\uff0c\u8fd9\u65f6\u6700\u5c0f\u7684\u53ef\u7528\u6574\u6570\u4e3a $n$\u3002\\n\\n\u4e8e\u662f\u53ef\u4ee5\u5f97\u51fa\u5982\u4e0b\u7ed3\u8bba\uff1a\\n\u5728\u8fd9\u4e00\u7ed3\u8bba\u7684\u57fa\u7840\u4e0b\uff0c\u53ef\u4ee5\u4f7f\u7528\u957f\u5ea6\u4e3a n + 1 \u7684\u6570\u7ec4\u6807\u8bb0\u533a\u95f4 $[0, n]$ \u5185\u7684\u67d0\u4e2a\u6574\u6570\u662f\u5426\u53ef\u7528\uff1a\\n\\n$minFree(x_1, x_2, ..., x_n) \\\\leqslant n$\\n\\n```python\\ndef min_free(lst):\\n  n = len(lst)\\n  flags = [False for i in range(n + 1)]\\n  for i in lst:\\n      if i < n:\\n          flags[i] = True\\n  for i, f in enumerate(flags):\\n      if f is False:\\n          return i\\n```\\n\\n\u8be5\u89e3\u6cd5\u7531\u4e09\u4e2a\u6b65\u9aa4\u7ec4\u6210\uff1a\\n\\n1. \u7b2c 3 \u884c\uff0c\u521d\u59cb\u5316\u4e00\u4e2a\u503c\u5168\u4e3a `False` \u7684\u6807\u5fd7\u6570\u7ec4\uff0c\u9700\u8981 $O(n)$ \u7684\u65f6\u95f4\uff1b\\n2. \u7b2c 4 ~ 6 \u884c\uff0c\u904d\u5386\u5217\u8868\u4e2d\u7684\u5143\u7d20\uff0c\u5c06\u5c0f\u4e8e n \u7684\u5143\u7d20\u6807\u8bb0\u4e3a `True`\uff0c\u9700\u8981 $O(n)$ \u7684\u65f6\u95f4\uff1b\\n3. \u7b2c 7 ~ 9 \u884c\uff0c\u904d\u5386\u6807\u5fd7\u6570\u7ec4\uff0c\u8fd4\u56de\u7b2c\u4e00\u4e2a`False` \u503c\u7684\u4f4d\u7f6e\uff0c\u9700\u8981 $O(n)$ \u7684\u65f6\u95f4\uff1b\\n\\n\u6bcf\u4e2a\u6b65\u9aa4\u6240\u9700\u7684\u65f6\u95f4\u5747\u4e3a $O(n)$ \uff0c\u6240\u4ee5\u8be5\u89e3\u6cd5\u7684\u65f6\u95f4\u590d\u6742\u5ea6\u662f\u7ebf\u6027\u7684\u3002\\n\\n\u8fd9\u91cc\u7528\u5230\u4e86 n + 1 \u4e2a\u6807\u5fd7\uff0c\u4f7f\u8fd9\u4e2a\u89e3\u6cd5\u65e0\u9700\u989d\u5916\u5904\u7406\u5c31\u53ef\u4ee5\u9002\u914d `sorted(lst) = [0, 1, ... n - 1]` \u7684\u60c5\u51b5\u3002\\n\\n\u8fd9\u4e2a\u89e3\u6cd5\u7684\u6548\u7387\u6bd4\u4e0a\u4e00\u4e2a\u89e3\u6cd5\u9ad8\u5f97\u591a\uff1a\u540c\u6837\u5bf9\u4e8e 10 \u4e07\u4e2a id\uff0c\u53ea\u9700\u8981 0.02s \u5c31\u53ef\u4ee5\u5f97\u5230\u7b54\u6848\u3002\\n\\n\u8be5\u89e3\u6cd5\u6bcf\u6b21\u90fd\u9700\u8981\u7533\u8bf7\u4e00\u4e2a\u957f\u5ea6\u4e3a n + 1 \u7684\u6570\u7ec4\uff0c\u8fd0\u884c\u7ed3\u675f\u540e\u8fd9\u4e2a\u6570\u7ec4\u53c8\u88ab\u91ca\u653e\u6389\u4e86\u3002\u4e3a\u4e86\u5bf9\u6b64\u8fdb\u884c\u4f18\u5316\uff0c\u539f\u4e66\u63d0\u4f9b\u4e86\u5bf9\u5e94\u7684 C \u8bed\u8a00\u5b9e\u73b0\u7684\u6539\u8fdb\uff1a\\n\\n1. \u9884\u5148\u51c6\u5907\u597d\u8db3\u591f\u957f\u7684\u6570\u7ec4\uff0c\u7136\u540e\u6bcf\u6b21\u90fd\u590d\u7528\u5b83\uff1b\\n2. \u4f7f\u7528\u4e8c\u8fdb\u5236\u4f4d\u4fdd\u5b58\u6807\u5fd7\uff1b\\n\\n\u4ee5\u4e0a\u6539\u8fdb\u51cf\u5c11\u4e86\u53cd\u590d\u521b\u5efa\u548c\u9500\u6bc1\u6807\u5fd7\u6570\u7ec4\u7684\u65f6\u95f4\uff0c\u4e5f\u51cf\u5c11\u4e86\u6807\u5fd7\u6570\u7ec4\u5360\u636e\u7684\u7a7a\u95f4\uff0c\u4f46\u662f\u5bf9\u5e94\u7684\u4f4d\u8fd0\u7b97\u76f8\u6bd4\u4e4b\u524d\u7684\u5e03\u5c14\u6570\u7ec4\u7e41\u590d\u4e86\u5f88\u591a\uff0c\u5728\u6b64\u5c31\u4e0d\u518d\u8d58\u8ff0\u3002\\n\\n## \u6539\u8fdb\u4e8c\\n\\n\u4e0a\u8ff0\u7684\u6539\u8fdb\u4ee5\u7a7a\u95f4\u4e0a\u7684\u6d88\u8017\u4e3a\u4ee3\u4ef7\u83b7\u5f97\u4e86\u8fd0\u884c\u65f6\u95f4\u4e0a\u7684\u4f18\u5316\uff0c\u4f46\u662f\u5728 n \u7279\u522b\u5927\u7684\u60c5\u51b5\u4e0b\uff0c\u7a7a\u95f4\u4e0a\u7684\u635f\u8017\u5c31\u4e0d\u53ef\u5ffd\u7565\u4e86\u3002\u4e3a\u6b64\uff0c\u65b0\u7684\u6539\u8fdb\u57fa\u4e8e\u5206\u800c\u6cbb\u4e4b\u7684\u65b9\u6cd5\uff0c\u5c06\u95ee\u9898\u5206\u89e3\u4e3a\u82e5\u5e72\u89c4\u6a21\u8f83\u5c0f\u7684\u95ee\u9898\uff0c\u7136\u540e\u9010\u6b65\u89e3\u51b3\u8fd9\u4e9b\u5c0f\u95ee\u9898\uff0c\u6700\u7ec8\u5f97\u5230\u7ed3\u679c\u3002\\n\\n\u5bf9\u8fd9\u4e2a\u95ee\u9898\u5e94\u7528\u5206\u6cbb\uff0c\u53ef\u4ee5\u5f97\u51fa\u5982\u4e0b\u89e3\u6cd5\uff1a\\n\\n> \u5c06\u6240\u6709\u6ee1\u8db3 $x_i \\\\leqslant \\\\lfloor n/2 \\\\rfloor$ \u7684\u6574\u6570\u653e\u5165\u5e8f\u5217 $A\'$\uff0c\u5e76\u5c06\u5269\u4f59\u7684\u6574\u6570\u653e\u5165\u53e6\u4e00\u4e2a\u5e8f\u5217 $A\'\'$\uff0c\u6839\u636e\u4e0a\u4e00\u4e2a\u6539\u8fdb\u5f97\u51fa\u7684\u7ed3\u8bba\uff0c\u5982\u679c $A\'$ \u7684\u957f\u5ea6\u6b63\u597d\u662f $\\\\lfloor n/2 \\\\rfloor$\uff0c\u8fd9\u8bf4\u660e $A\'$ \u5df2\u7ecf\u201c\u6ee1\u201d\u4e86\uff0c\u6700\u5c0f\u7684\u53ef\u7528\u6574\u6570\u4e00\u5b9a\u5728 $A\'\'$ \u4e2d\uff1b\u5426\u5219\uff0c\u6700\u5c0f\u7684\u53ef\u7528\u6574\u6570\u4e00\u5b9a\u5728 $A\'$ \u4e2d\u3002\\n\\n\u5728\u5f88\u591a\u7f16\u7a0b\u8bed\u8a00\u4e2d\u90fd\u63d0\u4f9b\u4e86\u5212\u5206\u64cd\u4f5c\uff1a\\n\\n1. Haskell `Data.List.partition`\\n\\n```haskell\\nimport Data.List\\n\\nbsearch :: [Int] -> Int -> Int -> Int\\nbsearch xs l u | null xs                = l\\n               | length as == m - l + 1 = bsearch bs (m + 1) u\\n               | otherwise              = bsearch as l m\\n where\\n  m        = (l + u) `div` 2\\n  (as, bs) = partition (<= m) xs\\n\\nminFree :: [Int] -> Int\\nminFree xs = bsearch xs 0 (length xs - 1)\\n```\\n\\n2. Python `\u5217\u8868\u63a8\u5bfc\u5f0f` \u6216 `filter`\\n\\n```python\\ndef min_free(lst, l, u):\\n    m = (l + u) // 2\\n    if not lst:\\n        return l\\n    left = [i for i in lst if i <= m]\\n    right = [i for i in lst if i > m]\\n    if len(left) == m - l + 1:\\n        return min_free(right, m + 1, u)\\n    else:\\n        return min_free(left, l, m)\\n```\\n\\n3. C++ `partition`\\n\\n```cpp\\n#include <algorithm>\\n#include <vector>\\nusing namespace std;\\n\\nint min_free(vector<int>::iterator begin, vector<int>::iterator end, int l, int u) {\\n  int m = (l + u) / 2;\\n  if (begin == end) {\\n    return l;\\n  }\\n  auto it = partition(begin, end, [m](int i) { return i <= m; });\\n  if (it - begin == m - l + 1) {\\n    return min_free(it, end, m + 1, u);\\n  } else {\\n    return min_free(begin, it, l, m);\\n  }\\n}\\n```\\n\\n\u4e0a\u8ff0\u89e3\u6cd5\u7684\u65f6\u95f4\u590d\u6742\u5ea6\u4e3a $O(n)$\uff1a\u7b2c\u4e00\u6b21\u9700\u8981 $O(n)$ \u6b21\u6bd4\u8f83\u6765\u5212\u5206\u5b50\u5e8f\u5217 $A\'$ \u548c $A\'\'$\uff0c\u7b2c\u4e8c\u6b21\u9700\u8981 $O(n/2)$ \u6b21\uff0c\u7b2c\u4e09\u6b21\u9700\u8981 $O(n/4)$ \u6b21 ... \uff0c\u603b\u65f6\u95f4\u590d\u6742\u5ea6\u4e3a $O(n+n/2+n/4+...) = O(2n) = O(n)$\u3002\\n\\n\u8be5\u89e3\u6cd5\u4e0d\u9700\u8981\u4f7f\u7528\u989d\u5916\u7684\u6808\u7a7a\u95f4\u4fdd\u5b58\u9012\u5f52\u8c03\u7528\uff0c\u662f\u56e0\u4e3a\u5176\u4e2d\u7684\u9012\u5f52\u8c03\u7528\u90fd\u662f\u5c3e\u9012\u5f52\uff0c\u5728\u51fd\u6570\u5f0f\u8bed\u8a00\u4e2d\u7b49\u540c\u4e8e\u8fed\u4ee3\uff1bC++ \u53ef\u4ee5\u901a\u8fc7\u5f00\u542f\u4f18\u5316\u9009\u9879\u6d88\u9664\u5c3e\u9012\u5f52\uff1b\u7279\u522b\u7684\uff0cPython \u4e0d\u652f\u6301\u5c3e\u9012\u5f52\u4f18\u5316\u3002\u5728\u8fd9\u79cd\u60c5\u51b5\u4e0b\uff0c\u7a7a\u95f4\u590d\u6742\u5ea6\u4e3a\u9012\u5f52\u6df1\u5ea6 $O(\\\\lg n)$\u3002\u4e3a\u4e86\u907f\u514d\u989d\u5916\u7684\u7a7a\u95f4\u5360\u7528\uff0c\u53ef\u4ee5\u624b\u5de5\u5c06\u9012\u5f52\u8f6c\u6362\u4e3a\u8fed\u4ee3\uff1a\\n\\n```cpp\\n#include <algorithm>\\n#include <vector>\\nusing namespace std;\\n\\nint min_free(vector<int> &lst) {\\n  int l = 0;\\n  int u = lst.size() - 1;\\n  auto begin = lst.begin();\\n  auto end = lst.end();\\n  while (end - begin) {\\n    int m = (l + u) / 2;\\n    auto left = partition(begin, end, [m](int i) { return i <= m; });\\n    if (left - begin == m - l + 1) {\\n      begin = left;\\n      l = m + 1;\\n    } else {\\n      end = left;\\n      u = m;\\n    }\\n  }\\n  return l;\\n}\\n```\\n\\n\u8fd9\u6bb5\u7a0b\u5e8f\u4f7f\u7528\u4e86\u7c7b\u4f3c\u5feb\u901f\u6392\u5e8f\u7684\u5206\u5272\u65b9\u6cd5\uff0c\u5c06\u6570\u7ec4\u4e2d\u7684\u5143\u7d20\u5206\u4e3a\u4e86\u4e24\u90e8\u5206\uff1a\u6240\u6709 left \u4e4b\u524d\u7684\u5143\u7d20\u90fd\u5c0f\u4e8e\u7b49\u4e8e m\uff0c\u6240\u6709 left \u548c right \u4e4b\u95f4\u7684\u5143\u7d20\u90fd\u5927\u4e8e m\u3002"}]}')}}]);