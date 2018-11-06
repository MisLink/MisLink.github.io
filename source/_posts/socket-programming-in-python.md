---
title: Python 中的 Socket 编程
tags:
  - Python
  - Socket
abbrlink: 73abcac3
date: 2018-08-20 00:01:53
---

本文翻译自 [Socket Programming in Python](https://realpython.com/python-sockets/)。

自豪的采用搜狗翻译。

## 写在前面

Socket 和 socket API 用于通过网络发送消息。它们提供了一种形式的[进程间通信](https://en.wikipedia.org/wiki/Inter-process_communication)（IPC）。网络可以是连接到计算机的逻辑本地网络，也可以是物理连接到外部网络的网络，它与其他网络有自己的连接。一个明显的例子是互联网，你可以通过你的 ISP 连接到它。

这个教程有三个不同的使用 Python 构建 socket 服务器和客户端的阶段：

1. 我们将从简单的 socket 服务器和客户端开始教程。
2. 一旦你看到了 API 以及它在这个初始示例中的工作方式，我们将会看到一个同时处理多个连接的改进版本。
3. 最后，我们将继续构建一个示例服务器和客户端，其功能类似于成熟的 socket 应用，并有自己的自定义头部和内容。

在本教程结束时，您将了解如何使用 Python [socket 模块](https://docs.python.org/3/library/socket.html)中的主要功能和方法编写自己的客户端 - 服务器应用程序。这包括向您展示如何使用自定义类在端点之间发送消息和数据，您可以在这些消息和数据的基础上构建这些它们并将其用于自己的应用程序。

本教程中的示例使用 Python 3.6。你可以在 GitHub 上找到[源代码](https://github.com/realpython/materials/tree/master/python-sockets-tutorial)。

网络和 socket 是很大的主题，已经有大量关于它们的术语了。如果你是 socket 或网络新手，如果你感到被所有的术语和内容淹没，这是完全正常的。

不过不要气馁。我为你写了这个教程。就像对待 Python 一样，我们可以一次学习一点。使用浏览器的书签功能，准备好下一节时再来。

我们开始吧！

## 背景

Socket 有着悠久的历史。它们的使用起源于 1971 年的 [ARPANET](https://en.wikipedia.org/wiki/Network_socket#History)，后来成为 1983 年发布的伯克利软件套装（BSD）操作系统中的 API，称为[伯克利 socket](https://en.wikipedia.org/wiki/Berkeley_sockets)。

当互联网在上世纪 90 年代随着万维网而起飞时，网络编程也是如此。Web 服务器和浏览器并不是唯一利用新连接的网络和使用 socket 的应用。各种类型和大小的客户机 - 服务器应用程序得到广泛使用。

今天，尽管 socket API 使用的底层协议已经发展了多年，我们已经看到了新的协议，但是低级 API 仍然保持不变。

最常见的 socket 应用程序是客户端 - 服务器应用程序，其中一方充当服务器并等待来自客户端的连接。这是我将在本教程中介绍的应用程序类型。更具体地说，我们将研究[互联网 socket](https://en.wikipedia.org/wiki/Berkeley_sockets) 的 socket API，有时称为伯克利或 BSD socket。还有 Unix 域 socket，只能用于同一台主机上的进程之间的通信。

## Socket API 概述

Python 的 [socket 模块](https://docs.python.org/3/library/socket.html)提供了[伯克利 socket API](https://en.wikipedia.org/wiki/Berkeley_sockets) 的接口。这是我们将在本教程中使用和讨论的模块。

本模块中的主要 socket API 函数和方法是：

- `socket()`
- `bind()`
- `listen()`
- `accept()`
- `connect()`
- `connect_ex()`
- `send()`
- `recv()`
- `close()`

Python 提供了一个方便和一致的 API，它直接映射到这些系统调用，它们的 C 对应者。我们将在下一节中探讨这些如何一起使用。

作为其标准库的一部分，Python 还有一些类，使得使用这些低级 socket 函数变得更加容易。虽然本教程中没有介绍，但是请参见 [socketserver 模块](https://docs.python.org/3/library/socketserver.html)，一个网络服务器框架。还有许多模块可以实现更高级别的互联网协议，如 HTTP 和 SMTP。请参见[互联网协议和支持](https://docs.python.org/3/library/internet.html)以了解概况。

## TCP Sockets

正如您稍后将看到的，我们将使用 `socket.socket()` 创建一个 socket 对象，并将 socket 类型指定为 `socket.SOCK_STREAM`。这样做时，使用的默认协议是[传输控制协议（TCP）](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)。这是一个很好的默认值，可能也是你想要的。

为什么要使用 TCP？传输控制协议（TCP）：

- **可靠**：网络中丢弃的数据包会被发送者检测并重新发送。
- **按顺序传递数据**：数据由应用程序按照发送者编写的顺序读取。

相反，使用 `socket.SOCK_DGRAM` 创建的[用户数据报协议（UDP）](https://en.wikipedia.org/wiki/User_Datagram_Protocol)是不可靠的，而且接收方读取的数据可能与发送方的写入顺序不一致。

为什么这很重要？网络是一个尽力而为的交付系统。不能保证你的数据会到达目的地，也不能保证你会收到发送给你的信息。

网络设备（例如路由器和交换机）有有限的可用带宽和自身固有的系统限制。他们有 CPU、内存、总线和接口包缓冲区，就像我们的客户端和服务器一样。TCP 使您不必担心[丢包](https://en.wikipedia.org/wiki/Packet_loss)、数据无序到达，以及在网络上通信时经常发生的许多其他事情。

在下图中，让我们看看 TCP 的 socket API 调用和数据流的顺序：

![](https://files.realpython.com/media/sockets-tcp-flow.1da426797e37.jpg)

左侧表示服务器。右边是客户端。

从左上角开始，注意服务器调用 API 来设置“监听者” socket：

- `socket()`
- `bind()`
- `listen()`
- `accept()`

监听者 socket 就像它听上去的那样，它监听来自客户端的连接。当客户端连接时，服务器调用 `accept()` 来接受或完成连接。

客户端调用 `connect()` 建立与服务器的连接，并启动三次握手。握手步骤很重要，因为它确保网络中连接的每一侧都可以到达，换句话说，客户端可以到达服务器，反之亦然。可能只有一个主机、客户端或服务器可以到达另一个主机。

中间是往返部分，客户端和服务器之间调用 `send()` 和 `recv()` 交换数据。

在底部，客户端和服务器使用 `close()` 关闭各自的 socket。

## Echo 客户端和服务器

现在，您已经看到了 socket API 的概述以及客户端和服务器的通信方式，让我们创建我们的第一个客户端和服务器。我们将从一个简单的实现开始。服务器将简单地将它收到的任何信息回复给客户端。

### Echo 服务器

这里是 Echo 服务器的实现，`echo-server.py`：

```python
import socket

HOST = "127.0.0.1"  # 标准回环接口地址（localhost）
PORT = 65432  # 要监听的端口（非特权端口 > 1023）

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()
    conn, addr = s.accept()
    with conn:
        print("Connected by", addr)
        while True:
            data = conn.recv(1024)
            if not data:
                break
            conn.sendall(data)
```

> **注意**：现在不要担心无法理解上面的一切。在这几行代码中有很多事情在发生。这只是一个起点，你可以看到一个基本的服务器在运行。
>
> 本教程末尾有一个参考部分，包含更多信息和指向其他资源的链接。我将在整个教程中链接到这些资源和其他资源。

让我们浏览一下每个 API 调用，看看发生了什么。

`socket.socket()` 创建了一个支持[上下文管理器](https://docs.python.org/3/reference/datamodel.html#context-managers)的 socket 对象，因此您可以在 [with 语句](https://docs.python.org/3/reference/compound_stmts.html#with)中使用它，因此没有必要调用 `s.close()` ：

```python
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    pass  # 使用 socket 对象而不调用 s.close().
```

传递给 [`socket()`](https://docs.python.org/3/library/socket.html#socket.socket) 的参数指定地址族和 socket 类型。`AF_INET` 是 [IPv4](https://en.wikipedia.org/wiki/IPv4) 的互联网地址族。`SOCK_STREAM` 是 TCP 的 socket 类型，该协议将用于在网络中传输我们的消息。

`bind()` 用于将 socket 与特定的网络接口和端口号相关联：

```python
HOST = "127.0.0.1"  # 标准回环接口地址（localhost）
PORT = 65432  # 要监听的端口（非特权端口 > 1023）

# ...

s.bind((HOST, PORT))
```

传递给 `bind()` 的值取决于 socket 的地址族。在这个例子中，我们使用 `socket.AF_INET`（IPv4）。所以它需要一个 2 元组：`(host, port)`。

`host` 可以是主机名、IP 地址或空字符串。如果使用 IP 地址，`host` 应该是 IPv4 格式的地址字符串。IP 地址 `127.0.0.1` 是[回环](https://en.wikipedia.org/wiki/Localhost)接口的标准 IPv4 地址，因此只有主机上的进程才能连接到服务器。如果传递空字符串，服务器将接受所有可用 IPv4 接口上的连接。

`port` 应为 `1 - 65535` 之间的整数（保留 `0`）。这是接受客户端连接的 [TCP 端口号](https://en.wikipedia.org/wiki/Transmission_Control_Protocol#TCP_ports)。如果端口 `< 1024`，某些系统可能需要超级用户权限。

以下是关于在 `bind()` 中使用主机名的说明：

> “如果在 IPv4/v6 socket 地址的主机部分使用主机名，程序可能会显示不确定性行为，因为 Python 使用从 DNS 解析返回的第一个地址。Socket 地址将以不同方式解析为实际的 IPv4/v6 地址，具体取决于 DNS 解析和/或主机配置的结果。对于确定性行为，在主机部分使用数字地址。”（[来源](https://docs.python.org/3/library/socket.html)）

稍后我将在使用主机名这一节讨论这一点，但在这里值得一提。现在，只要了解使用主机名时，您可能会看到不同的结果，这取决于名称解析过程返回的结果。

它可能是任何东西。第一次运行应用程序时，它可能是地址 `10.1.2.3`。下次是不同的地址，`192.168.0.1`。第三次，可能是 `172.16.7.8`，依此类推。

继续服务器示例，`listen()` 使服务器能够使用 `accept()` 接受连接。它使它成为一个“监听者” socket：

```python
s.listen()
conn, addr = s.accept()
```

`listen()` 有一个 `backlog` 参数。它指定系统在拒绝新连接之前允许的未接受连接的数量。从 Python 3.5 开始，它是可选的。如果未指定，则选择默认 `backlog` 值。

如果您的服务器同时收到大量连接请求，增加 `backlog` 值可能有助于设置挂起连接的队列最大长度。最大值取决于系统。例如，在 Linux 上，请参见 [`/proc/sys/net/core/somaxconn`](https://serverfault.com/questions/518862/will-increasing-net-core-somaxconn-make-a-difference/519152)。

`accept()` 阻塞并等待有连接进入。当客户端连接时，它返回一个表示连接的新 socket 对象和一个保存客户端地址的元组。对于 IPv4 连接元组包含 `(host, port)`，对于 IPv6 则是 `(host, port, flowinfo, scopeid)`。有关元组值的详细信息，请参见参考部分中的 socket 地址族。

必须了解的一件事是，我们现在有了来自 `accept()` 的新 socket 对象。这一点很重要，因为它是你用来与客户沟通的 socket。它不同于服务器用来接受新连接的监听者 socket：

```python
conn, addr = s.accept()
with conn:
    print('Connected by', addr)
    while True:
        data = conn.recv(1024)
        if not data:
            break
        conn.sendall(data)
```

从 `accept()` 获得客户端 socket 对象 `conn` 后，使用无限 `while` 循环来检查对 `conn.recv()` 的阻塞调用。这将读取客户端发送的任何数据，并使用 `conn.sendall()` 回复。

如果 `conn.recv()` 返回空[字节](https://docs.python.org/3/library/stdtypes.html#bytes-objects)对象 `b''`，name 表示客户端关闭连接并终止循环。`with` 语句与 `conn` 一起使用，自动关闭块末尾的 socket。

### Echo 客户端

现在让我们来看看客户端，`echo-client.py`：

```python
import socket

HOST = "127.0.0.1"  # 服务器的主机名或 IP 地址
PORT = 65432  # 服务器使用的端口

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((HOST, PORT))
    s.sendall(b"Hello, world")
    data = s.recv(1024)

print("Received", repr(data))
```

与服务器相比，客户端非常简单。它创建一个 socket 对象，连接到服务器并调用 `s.sendall()`发送消息。最后，它调用 `s.recv()` 读取服务器的回复，然后打印出来。

### 运行 Echo 客户端和服务器

让我们运行客户端和服务器，看看它们的行为，并检查正在发生的事情。

> **注意**：如果在从命令行运行示例或自己的代码时遇到困难，请阅读[如何使用 Python 编写自己的命令行命令？](https://dbader.org/blog/how-to-make-command-line-commands-with-python)如果您在 Windows 上，请查看 [Python Windows 常见问题解答](https://docs.python.org/3.6/faq/windows.html)。

打开终端或命令提示符，导航到包含脚本的目录，然后运行服务器：

```bash
$ python ./echo-server.py
```

你的终端看起来会挂起。这是因为服务器在下面的调用中被阻塞（暂停）：

```python
conn, addr = s.accept()
```

它正在等待客户端连接。现在打开另一个终端窗口或命令提示符，运行客户端：

```bash
$ python ./echo-client.py
Received b'Hello, world'
```

在服务器窗口中，您应该看到：

```bash
Connected by ('127.0.0.1', 64623)
```

在上面的输出中，服务器打印了从 `s.accept()` 返回的 `addr` 元组。这是客户端的 IP 地址和 TCP 端口号。当您在机器上运行时，端口号很可能会不是 64623。

### 查看 Socket 状态

要查看主机上 socket 的当前状态，请使用 `netstat`。默认情况下，它可以在 macOS、Linux 和 Windows 上使用。

以下是启动服务器后 macOS 的 `netstat` 输出：

```bash
$ netstat -an
Active Internet connections (including servers)
Proto Recv-Q Send-Q  Local Address          Foreign Address        (state)
tcp4       0      0  127.0.0.1.65432        *.*                    LISTEN
```

请注意，本地地址是 `127.0.0.1.65432`。如果 `echo-server.py` 使用了 `HOST = ''` 而不是 `HOST = '127.0.0.1'`，`netstat` 会显示这一点：

```shell
$ netstat -an
Active Internet connections (including servers)
Proto Recv-Q Send-Q  Local Address          Foreign Address        (state)
tcp4       0      0  *.65432                *.*                    LISTEN
```

本地地址为 `*.65432`，这意味着支持地址族的所有可用主机接口都将用于接受传入连接。在这个例子中，在对 `socket()` 的调用中，使用了 `socket.AF_INET` （IPv4）。您可以在 `Proto` 列：`tcp4` 中看到这一点。

我修剪了上面的输出，只显示 Echo 服务器。你可能会看到更多的输出，这取决于你运行的系统。需要注意的是 `Proto`、`Local Address` 和 `(state)` 列。在上面的最后一个示例中，`netstat` 显示 Echo 服务器正在所有接口 `(*.65432)` 的端口 65432 上使用 IPv4 TCP socket `(tcp4)`，并且处于监听状态 `(LISTEN)`。

另一种方法也可以看到这些，以及其他有用的信息：使用 `lsof` （列出打开的文件）。默认情况下，它在 macOS 上可用，如果还没有安装，可以使用您的软件包管理器在 Linux 上安装：

```shell
$ lsof -i -n
COMMAND    PID     USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
python3.7 4922     <me>    3u  IPv4 0x57cec31dfece6b87      0t0  TCP *:65432 (LISTEN)
```

当与 `-i` 选项一起使用时，`lsof` 为您提供了 `COMMAND`、`PID`（进程 id）和 `USER`（用户 id）。以上是 Echo 服务器进程。

`netstat` 和 `lsof` 有很多可用的选项，并且根据运行它们的操作系统而有所不同。查看 `man` 或文档以了解两者。他们绝对值得花一点时间去了解，你会从中收益的。在 macOS 和 Linux 上，使用 `man netstat` 和 `man lsof`，在 Windows 上，使用 `netstat /?`。

当尝试连接到没有监听 socket 的端口时，你会看到一个常见的错误：

```shell
$ python ./echo-client.py
Traceback (most recent call last):
  File "./echo-client.py", line 9, in <module>
    s.connect((HOST, PORT))
ConnectionRefusedError: [Errno 61] Connection refused
```

指定的端口号错误或服务器未运行。或者可能有防火墙阻止连接，这很容易忘记。您还可能会看到错误 `Connection timed out`。添加允许客户端连接到 TCP 端口的防火墙规则！

参考部分列出了常见错误。

## 通信分析

让我们仔细看看客户端和服务器是如何相互通信的：

![](https://files.realpython.com/media/sockets-loopback-interface.44fa30c53c70.jpg)

使用[回环](https://en.wikipedia.org/wiki/Localhost)接口（IPv4 地址 `127.0.0.1` 或 IPv6 地址 `::1`）时，数据永远不会离开主机接触外部网络。在上图中，回环接口包含在主机内部。这表示回环接口的内部特性，以及传输它的连接和数据是主机本地的。这就是为什么您还会听到回环接口和 IP 地址 `127.0.0.1` 或 `::1` 被称为“本地主机（localhost）”。

应用程序使用回环接口与主机上运行的其他进程进行通信，以实现安全性和与外部网络的隔离。因为它是内部的，只能从主机内部访问，所以不会暴露出来。

如果您有一个使用自己私有数据库的应用服务器，您可以看到这一点。如果它不是其他服务器使用的数据库，它可能被配置为只监听回环接口上的连接。如果是这种情况，网络上的其他主机无法连接到它。

当您在应用程序中使用 `127.0.0.1` 或 `::1` 以外的 IP 地址时，它可能绑定到连接到外部网络的[以太网](https://en.wikipedia.org/wiki/Ethernet)接口。这是通往“本地主机”王国之外的其他主机的门户：

![](https://files.realpython.com/media/sockets-ethernet-interface.aac312541af5.jpg)

小心外面。这是一个肮脏、残酷的世界。在脱离“localhost”的安全范围冒险之前，一定要阅读使用主机名的章节。有一个安全注意事项适用，即使您不使用主机名，也只使用 IP 地址。

## 处理多个连接

Echo 服务器肯定有其局限性。最大的问题是它只为一个客户服务，然后退出。Echo 客户端也有这个限制，但是还有另外一个问题。当客户端进行以下调用时，`s.recv()` 可能只返回来自 `b'Hello, world'` 的一个字节 `b'H'`：

```python
data = s.recv(1024)
```

上面使用的 `bufsize` 参数 1024 是一次接收的最大数据量。这并不意味着 `recv()` 将返回 1024 字节。

`send()` 也有这种行为。`send()` 返回发送的字节数，这可能小于传入数据的大小。您负责检查这一点，并根据需要多次调用 `send()` 来发送所有数据：

> “应用程序负责检查所有数据是否已经发送；如果只传输了一些数据，应用程序需要尝试传递剩余的数据。”（[来源](https://docs.python.org/3/library/socket.html#socket.socket.send)）

我们通过使用 `sendall()` 避免了这样做：

> “与 `send()` 不同，此方法继续从字节发送数据，直到发送完所有数据或出现错误。成功后会返回 `None`。”（[来源](https://docs.python.org/3/library/socket.html#socket.socket.sendall)）

在这一点上，我们有两个问题：

- 我们如何同时处理多个连接？
- 我们需要调用 `send()` 和 `recv()`，直到所有数据被发送或接收。

我们该怎么办？[并发](https://docs.python.org/3/library/concurrency.html)有许多方法。最近，一种流行的方法是使用[异步 I/O](https://docs.python.org/3/library/asyncio.html)。`asyncio` 在 Python 3.4 中被引入 。传统的选择是使用[线程](https://docs.python.org/3/library/threading.html)。

并发的问题是很难做对。有许多微妙之处需要考虑和防范。只要有其中一个表现出来，你的应用程序可能会突然以不那么微妙的方式失败。

我这样说并不是为了吓退你学习和使用并发编程。如果您的应用程序需要扩展，如果您想要使用多个处理器或多个核，这是必要的。然而，对于本教程，我们将使用比线程更传统、更容易解释的东西。我们将使用系统调用的鼻祖：`select()`。

`select()` 允许您检查多个 socket 上的 I/O 完成情况。因此，您可以调用 `select()` 来查看哪些 socket 有 I/O 可供读取和/或写入。但是这是 Python，所以还有更多。我们使用标准库中的 [selectors](https://docs.python.org/3/library/selectors.html) 模块，因此不管我们运行的是什么操作系统，都将使用最有效的实现：

> 该模块允许基于 select 模块原语实现高级、高效的 I/O 多路复用。鼓励用户使用这个模块，除非他们想要对所使用的操作系统级原语进行精确控制。（[来源](https://docs.python.org/3/library/selectors.html)）

尽管通过使用 `select()`，我们无法并行运行，但根据您的工作负载，这种方法可能仍然很快。这取决于应用程序在服务请求时需要做什么以及需要支持的客户端数量。

[asyncio](https://docs.python.org/3/library/asyncio.html) 使用单线程协同多任务和事件循环来管理任务。使用 `select()`，我们将编写我们自己的事件循环版本，尽管更加简单和同步。当使用多线程时，即使具有并发性，我们目前也必须将 [GIL](https://realpython.com/python-gil/) 与 [CPython 和 PyPy](https://wiki.python.org/moin/GlobalInterpreterLock) 一起使用。这实际上限制了我们可以并行完成的工作量。

我这么说是为了解释使用 `select()` 可能是一个非常好的选择。不要觉得必须使用异步、线程或最新的异步库。通常，在网络应用程序中，您的应用程序是 I/O 密集的：它可能在本地网络、网络另一端的端点、磁盘等上等待。

如果你收到了启动 CPU 相关工作的客户端的请求，看看 [concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html) 模块。它包含使用进程池异步执行调用的 [ProcessPoolExecutor](https://docs.python.org/3/library/concurrent.futures.html#processpoolexecutor) 类。

如果您使用多个进程，操作系统能够调度 Python 代码在多个处理器或内核上并行运行，而无需 GIL。有关想法和灵感，请参见 PyCon 演讲 [John Reese - Thinking Outside the GIL with AsyncIO and Multiprocessing - PyCon 2018](https://www.youtube.com/watch?v=0kXaLh8Fz3k)。

在下一节中，我们将查看解决这些问题的服务器和客户端的示例。他们使用 `select()` 同时处理多个连接，并根据需要多次调用 `send()` 和 `recv()`。

## 多连接客户端和服务器

在接下来的两节中，我们将使用从 [selectors](https://docs.python.org/3/library/selectors.html) 模块创建的 `selector` 对象创建一个处理多个连接的服务器和客户端。

### 多连接服务器

首先，让我们来看一下多连接服务器，`multiconn-server.py`。下面是设置监听者 socket 的第一部分：

```python
import selectors

sel = selectors.DefaultSelector()
# ...
lsock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
lsock.bind((host, port))
lsock.listen()
print("listening on", (host, port))
lsock.setblocking(False)
sel.register(lsock, selectors.EVENT_READ, data=None)
```

这个服务器和 Echo 服务器之间的最大区别是调用 `lsock.setblocking(False)` 以非阻塞模式配置 socket。对这个 socket 的调用将不再阻塞。当它与 `sel.select()` 一起使用时，正如您将在下面看到的，我们可以在一个或多个 socket 上等待事件，然后在数据准备好时读写数据。

`sel.register()` 注册要用 `sel.select()` 监控的 socket，以获取您感兴趣的事件。对于监听者 socket，我们想要读取事件：`selectors.EVENT_READ`。

`data` 用于存储 socket 中任何你想要的数据。当 `select()` 返回时，它会返回。我们将使用 `data` 来跟踪 socket 上发送和接收的内容。

接下来是事件循环：

```python
import selectors

sel = selectors.DefaultSelector()

# ...

while True:
    events = sel.select(timeout=None)
    for key, mask in events:
        if key.data is None:
            accept_wrapper(key.fileobj)
        else:
            service_connection(key, mask)
```

[`sel.select(timeout=None)`](https://docs.python.org/3/library/selectors.html#selectors.BaseSelector.select) 阻塞直到有 socket 可供 I/O。它返回 `(key, mask)` 元组列表，每个 socket 一个元组。`key` 是一个包含 `fileobj` 属性的 [SelectorKey](https://docs.python.org/3/library/selectors.html#selectors.SelectorKey) 命名元组。`key.fileobj` 是一个 socket 对象，`mask` 是准备好的操作的事件掩码。

如果 `key.data` 为 `None`，我们就知道它来自监听者 socket，我们需要使用 `accept()` 接受连接。我们将调用我们自己的 `accept()` 包装函数来获取新的 socket 对象，并向选择器注册它。我们过一会儿再看。

如果 `key.data` 不为 `None`，那么我们知道这是一个已经被接受的客户端 socket，我们需要为它提供服务。之后调用 `service_connection()` 并传递 `key` 和 `mask`，其中包含我们在 socket 上操作所需的所有内容。

让我们看看我们的 `accept_wrapper()` 函数是做什么的：

```python
def accept_wrapper(sock):
    conn, addr = sock.accept()  # 应该可以读了
    print("accepted connection from", addr)
    conn.setblocking(False)
    data = types.SimpleNamespace(addr=addr, inb=b"", outb=b"")
    events = selectors.EVENT_READ | selectors.EVENT_WRITE
    sel.register(conn, events, data=data)
```

因为监听者 socket 是注册在 `selectors.EVENT_READ` 事件上的，所以它应该已经可以读了。我们调用 `sock.accept()`，然后立即调用 `conn.setblocking(False)`，将 socket 置于非阻塞模式。

记住，这是这个版本的服务器的主要目标，因为我们不想阻塞它。如果它阻塞了，那么整个服务器就会停止运行，直到它返回。这意味着其他 socket 都在等待。这是可怕的“挂起”状态，你不想让你的服务器进入这种状态。

接下来，我们使用类 `types.SimpleNamespace` 创建一个对象来保存我们希望与 socket 一起包含的数据。因为我们想知道客户端连接何时可以读写，所以这两个事件是通过以下方式设置的：

```python
events = selectors.EVENT_READ | selectors.EVENT_WRITE
```

`event mask`、socket 和 `data` 对象随后被传递给 `sel.register()`。

现在让我们看看 `service_connection()`，看看客户端连接准备就绪后如何处理：

```python
def service_connection(key, mask):
    sock = key.fileobj
    data = key.data
    if mask & selectors.EVENT_READ:
        recv_data = sock.recv(1024)  # 应该可以读了
        if recv_data:
            data.outb += recv_data
        else:
            print("closing connection to", data.addr)
            sel.unregister(sock)
            sock.close()
    if mask & selectors.EVENT_WRITE:
        if data.outb:
            print("echoing", repr(data.outb), "to", data.addr)
            sent = sock.send(data.outb)  # 应该可以写了
            data.outb = data.outb[sent:]
```

这是多连接服务器的核心。`key` 是从 `select()` 返回的命名元组，它包含 socket 对象 （`fileobj`） 和 `data` 对象。`mask` 包含准备好的事件。

如果 socket 已经准备好读，那么 `mask & selectors.EVENT_READ` 为 `True`，然后调用 `sock.recv()` 。任何被读取的数据都会被附加到 `data.outb`，以便以后发送。

注意 `else:` 块，如果没有收到数据：

```python
if recv_data:
    data.outb += recv_data
else:
    print("closing connection to", data.addr)
    sel.unregister(sock)
    sock.close()
```

这意味着客户端已经关闭了它们的 socket，所以服务器也应该关闭。但是不要忘记首先调用 `sel.unregister()`，这样 `select()` 就不再监听它了。

当 socket 准备写入时（健康的 socket 应该总是这样），任何接收到的数据都存储在 `data.outb` 中，并使用 `sock.send()` 向客户端发出响应。然后从发送缓冲区中删除发送的字节：

```python
data.outb = data.outb[sent:]
```

### 多连接客户端

现在让我们看看多连接客户端，`multiconn-client.py`。它与服务器非常相似，但是它不是监听连接，而是通过 `start_connections()` 启动连接：

```python
messages = [b"Message 1 from client.", b"Message 2 from client."]


def start_connections(host, port, num_conns):
    server_addr = (host, port)
    for i in range(0, num_conns):
        connid = i + 1
        print("starting connection", connid, "to", server_addr)
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setblocking(False)
        sock.connect_ex(server_addr)
        events = selectors.EVENT_READ | selectors.EVENT_WRITE
        data = types.SimpleNamespace(
            connid=connid,
            msg_total=sum(len(m) for m in messages),
            recv_total=0,
            messages=list(messages),
            outb=b"",
        )
        sel.register(sock, events, data=data)
```

`num_conns` 是从命令行读取的，它是要创建到服务器的连接数。就像服务器一样，每个 socket 都被设置为非阻塞模式。

使用 `connect_ex()` 代替 `connect()`，因为 `connect()` 会立即引发 `BlockingIOError` 异常。`connect_ex()` 最初返回一个错误指示符 `errno.EINPROGRESS`，而不是在连接进行时引发异常。一旦连接完成，socket 就可以读写了，并由 `select()` 返回。

在 socket 初始化之后，我们希望与 socket 一起存储的数据是使用类 `types.SimpleNamespace` 创建的。客户端将发送给服务器的消息使用 `list(messages)` 复制，因为每个连接都将调用 `socket.send()` 并修改列表。跟踪客户端需要发送、发送和接收的内容所需的一切，以及消息中的总字节数都存储在对象 `data` 中。

让我们看看 `service_connection()`。它与服务器基本相同：

```python
def service_connection(key, mask):
    sock = key.fileobj
    data = key.data
    if mask & selectors.EVENT_READ:
        recv_data = sock.recv(1024)  # 应该可以读了
        if recv_data:
            print("received", repr(recv_data), "from connection", data.connid)
            data.recv_total += len(recv_data)
        if not recv_data or data.recv_total == data.msg_total:
            print("closing connection", data.connid)
            sel.unregister(sock)
            sock.close()
    if mask & selectors.EVENT_WRITE:
        if not data.outb and data.messages:
            data.outb = data.messages.pop(0)
        if data.outb:
            print("sending", repr(data.outb), "to connection", data.connid)
            sent = sock.send(data.outb)  # 应该可以写了
            data.outb = data.outb[sent:]
```

有一个重要的区别。它跟踪从服务器接收到的字节数，以便关闭它的连接。当服务器检测到这一点时，它也会关闭它的连接。

请注意，通过这样做，服务器取决于客户端是否表现良好：服务器希望客户端在发送完消息后关闭其连接。如果客户端没有关闭，服务器将保持连接打开。在真实的应用程序中，您可能希望在服务器中防止这种情况，并防止客户端连接在一定时间后不发送请求而累积。

### 运行多连接客户端和服务器

现在让我们运行 `multiconn-server.py` 和 `multiconn-client.py`。它们都使用命令行参数。您可以在没有参数的情况下运行它们来查看选项。

对于服务器，传递主机和端口号：

```shell
$ python ./multiconn-server.py
usage: ./multiconn-server.py <host> <port>
```

对于客户端，还要将要创建的连接数传递给服务器，`num_connections`：

```shell
$ python ./multiconn-client.py
usage: ./multiconn-client.py <host> <port> <num_connections>
```

以下是在端口 65432 上监听回环接口时的服务器输出：

```shell
$ python ./multiconn-server.py 127.0.0.1 65432
listening on ('127.0.0.1', 65432)
accepted connection from ('127.0.0.1', 53740)
accepted connection from ('127.0.0.1', 53741)
echoing b'Message 1 from client.Message 2 from client.' to ('127.0.0.1', 53740)
echoing b'Message 1 from client.Message 2 from client.' to ('127.0.0.1', 53741)
closing connection to ('127.0.0.1', 53740)
closing connection to ('127.0.0.1', 53741)
```

以下是客户端在创建与上述服务器的两个连接时的输出：

```shell
$ python ./multiconn-client.py 127.0.0.1 65432 2
starting connection 1 to ('127.0.0.1', 65432)
starting connection 2 to ('127.0.0.1', 65432)
sending b'Message 1 from client.' to connection 1
sending b'Message 2 from client.' to connection 1
sending b'Message 1 from client.' to connection 2
sending b'Message 2 from client.' to connection 2
received b'Message 1 from client.Message 2 from client.' from connection 1
closing connection 1
received b'Message 1 from client.Message 2 from client.' from connection 2
closing connection 2
```

## 应用客户端和服务器

与我们开始时相比，多连接客户端和服务器示例无疑是一个改进。然而，让我们再走一步，在最终实现中解决前面“multiconn”示例的缺点：应用客户端和服务器。

我们希望客户端和服务器能够适当处理错误，这样其他连接就不会受到影响。很明显，如果没有发现异常，我们的客户端或服务器不应该在愤怒中崩溃。这是我们到目前为止还没有讨论过的事情。为了简洁明了，我故意省略了错误处理。

现在您已经熟悉了基本的 API、非阻塞 socket 和 `select()`，我们可以添加一些错误处理，并讨论一下我一直隐藏在那边的大窗帘后面的“房间里的大象”（不愿多谈的问题）。是的，我在谈论我在引言中提到的自定义类。我知道你不会忘记。

首先，我们处理错误：

> “所有错误都会引发异常。可以引发无效参数类型和内存不足的正常异常；从 Python 3.3 开始，与 socket 或地址语义相关的错误会引发 `OSError` 或其子类之一。”（[来源](https://docs.python.org/3/library/socket.html)）

我们需要捕获 `OSError`。关于错误，我没有提到的另一件事是超时。你会在文档的许多地方看到对它们的讨论。超时会发生，是“正常”错误。主机和路由器重新启动，交换机端口损坏，电缆损坏，电缆被拔掉，这是你能想到的。您应该为这些错误和其他错误做好准备，并在代码中处理它们。

“房间里的大象”呢？正如 socket 类型 `socket.SOCK_STREAM` 所暗示的，当使用 TCP 时，您正在从连续的字节流中读取。这就像是从磁盘上的文件中读取，但实际上是从网络中读取字节。

然而，与读取文件不同，没有 [`f.seek()`](https://docs.python.org/3/tutorial/inputoutput.html#methods-of-file-objects)。换句话说，如果有 socket 指针的话，你不能重新定位它，也不能随意地在数据周围移动。

当字节到达 socket 时，会涉及网络缓冲区。一旦你读过它们，它们就需要被保存在某个地方。再次调用 `recv()` 读取 socket 中可用的下一个字节流。

这意味着您将分块读取 socket。您需要调用 `recv()` 并将数据保存在缓冲区中，直到您读取了足够多的字节以获得对您的应用程序有意义的完整消息为止。

由你来定义和跟踪消息边界的位置。就 TCP socket 而言，它只是向网络发送原始字节和从网络接收原始字节。它不知道这些原始字节意味着什么。

这就给我们带来了一个应用层协议的定义。什么是应用层协议？简单地说，您的应用程序将发送和接收消息。这些消息是应用程序的协议。

换句话说，为这些消息选择的长度和格式定义了应用程序的语义和行为。这与我在上一段中解释的有关从 socket 读取字节的内容直接相关。当您使用 `recv()` 读取字节时，您需要维护读取的字节数，并找出消息边界的位置。

这是怎么做到的？一种方法是总是发送固定长度的消息。如果它们总是一样大，那就很容易了。当你把这个字节数读入缓冲区时，你就知道你有一条完整的消息。

然而，使用固定长度的消息对于需要填充的小消息来说是低效的。此外，对于不适合放在一条消息的数据，你仍然面临着如何处理的问题。

在本教程中，我们将采用通用方法。许多协议都使用这种方法，包括 HTTP。我们将在消息前加一个头部，包括内容长度以及我们需要的任何其他字段。通过这样做，我们只需要维护头部。一旦我们读取了头部，我们就可以通过处理它来确定消息内容的长度，然后读取该字节数来消费它。

我们将通过创建一个自定义类来实现这一点，该类可以发送和接收包含文本或二进制数据的消息。您可以为自己的应用程序改进和扩展它。最重要的是，你将能够看到一个如何做到这一点的例子。

我需要提到一些可能影响到您的有关 socket 和字节的内容。正如我们前面提到的，当通过 socket 发送和接收数据时，您发送和接收原始字节。

如果您接收数据并希望在将其解释为多字节（例如 4 字节整数）的上下文中使用数据，则需要考虑到数据的格式可能不是您机器的 CPU 所固有的。另一端的客户端或服务器可能有一个 CPU，它使用的字节顺序与您自己的不同。如果是这种情况，则需要将其转换为主机的本机字节顺序，然后才能使用它。

这个字节顺序被称为 CPU 的[字节顺序](https://en.wikipedia.org/wiki/Endianness)。有关详细信息，请参见参考部分中的字节序。我们将通过利用 Unicode 作为我们的消息头部并使用编码 UTF-8 来避免这个问题。由于 UTF-8 使用 8 位编码，因此不存在字节排序问题。

您可以在 Python 的[编码和 Unicode](https://docs.python.org/3/library/codecs.html#encodings-and-unicode) 文档中找到解释。请注意，这仅适用于文本头部。我们将使用在头部中定义的显式类型和编码，用于正在发送的内容，即消息载荷。这将允许我们以任何格式传输任何我们期望的数据（文本或二进制）。

您可以使用 `sys.byteorder` 轻松确定机器的字节顺序。例如，在我的英特尔笔记本电脑上，这种情况就会发生：

```shell
$ python -c 'import sys; print(repr(sys.byteorder))'
'little'
```

如果我在[模拟](https://www.qemu.org/)大端 CPU（PowerPC）的虚拟机中运行此功能，则会发生以下情况：

```shell
$ python -c 'import sys; print(repr(sys.byteorder))'
'big'
```

在这个示例应用程序中，我们的应用层协议将头部定义为 UTF-8 编码的 Unicode 文本。对于消息中的实际内容，即消息载荷，如果需要，您仍然需要手动交换字节顺序。

这将取决于您的应用程序，以及是否需要处理来自具有不同字符顺序的机器的多字节二进制数据。您可以通过在头部中添加额外的头部并使用它们传递参数来帮助客户端或服务器实现二进制支持，类似于 HTTP。

如果还是很难理解，不要担心。在下一节中，您将看到所有这些都是如何工作，并结合在一起的。

### 应用协议头部

让我们定义完整的协议头部。协议头部是：

- 可变长度文本
- 编码为 UTF-8
- 使用 JSON 序列化的 Python 字典

协议头部字典中所需的头部如下：

| 名称               | 描述                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| `byteorder`        | 机器的字节顺序（使用 `sys.byteorder`）。您的应用程序可能不需要。          |
| `content-length`   | 内容的长度（以字节为单位）。                                              |
| `content-type`     | 载荷中的内容类型，例如，`text/json` 或 `binary/my-binary-type`。          |
| `content-encoding` | 内容使用的编码，例如 `utf-8` 用于 Unicode 文本，`binary` 用于二进制数据。 |

这些头部通知接收者消息载荷中的内容。这允许您发送任意数据，同时提供足够的信息，以便接收方能够正确解码和解释内容。由于头部在字典中，通过根据需要插入键/值对来添加额外的头部很容易。

### 发送应用消息

还有一点问题。我们有一个可变长度的头部，它既漂亮又灵活，但是当用 `recv()` 读取它时，你怎么知道头部的长度呢？

当我们之前谈到使用 `recv()` 和消息边界时，我提到固定长度的头部可能效率低下。这是真的，但是我们将使用一个小的，2 字节的，固定长度的头部作为包含其长度的 JSON 头部的前缀。

你可以认为这是一种发送消息的混合方式。实际上，我们通过首先发送头部长度来引导消息接收过程。这使得我们的接收者很容易解构信息。

为了让你对消息格式有更好的了解，让我们来看看消息的整体：

![](https://files.realpython.com/media/sockets-app-message.2e131b0751e3.jpg)

消息以固定长度的 2 字节头部开始，这是一个按网络字节顺序排列的整数。这是下一个头部的长度，即可变长度的 JSON 头部。一旦我们用 `recv()` 读取了 2 个字节，我们就知道我们可以将这 2 个字节作为整数处理，然后在解码 UTF-8 JSON 头部之前读取该字节数。

JSON 头部包含附加头部的字典。其中之一是内容长度，即消息内容的字节数（不包括 JSON 头）。一旦我们调用了 `recv()` 并读取了内容长度字节，我们就到达了消息边界并读取了整个消息。

### 应用 Message 类

最后，回报！让我们看看 `Message` 类，看看当 socket 上发生读写事件时，它是如何与 `select()` 一起使用的。

对于这个示例程序，我必须有客户端和服务器将使用什么类型的消息的想法。此时，我们远远超出了玩具 Echo 客户端和服务器。

为了让事情简单，并且仍然演示在真实程序中如何工作，我创建了一个实现基本搜索功能的应用程序协议。客户端发送搜索请求，服务器查找匹配项。如果客户端发送的请求没有被识别为一次搜索，服务器会假设它是二进制请求并返回二进制响应。

阅读下面的章节，运行示例，并对代码进行实验后，你将看到事情是如何运作的。然后，您可以使用 `Message` 类作为起点，并修改它以供自己使用。

我们实际上离“multiconn”客户端和服务器示例并不远。事件循环代码在 `app-client.py` 和 `app-server.py` 中保持不变。我所做的是将消息代码移动到一个名为 `Message` 的类中，并添加了支持读、写和处理头部和内容的方法。这是使用类的一个很好的例子。

正如我们前面所讨论的，你将在下面看到，使用 socket 涉及保持状态。通过使用类，我们将所有的状态、数据和代码组合在一个有组织的单元中。启动或接受连接时，将为客户端和服务器中的每个 socket 创建类的实例。

对于包装器和通用方法，客户端和服务器的类基本相同。它们以下划线开始，就像 `Message._json_encode()` 一样。这些方法简化了类的工作。他们帮助其他方法，让他们保持短小，保持 [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) 原则。

服务器的 `Message` 类的工作方式与客户端的基本相同。不同之处在于客户端启动连接并发送请求消息，然后处理服务器的响应消息。相反，服务器等待连接，处理客户端的请求消息，然后发送响应消息。

看起来是这样的：

| 步骤 | 端点   | 动作/消息内容                  |
| ---- | ------ | ------------------------------ |
| 1    | 客户端 | 发送包含请求内容的 `Message`   |
| 2    | 服务器 | 接收并处理客户端请求 `Message` |
| 3    | 服务器 | 发送包含响应内容的 `Message`   |
| 4    | 客户端 | 接收并处理服务器响应 `Message` |

以下是文件和代码布局：

| 应用   | 文件          | 代码                  |
| ------ | ------------- | --------------------- |
| 服务器 | app-server.py | 服务器的主程序        |
| 服务器 | libserver.py  | 服务器的 `Message` 类 |
| 客户端 | app-client.py | 客户端的主程序        |
| 客户端 | libclient.py  | 客户端的 `Message` 类 |

### Message 入口点

我想讨论一下 `Message` 类是如何工作的，首先提到它的设计中一个对我来说并不显而易见的方面。只有在重构了至少五次之后，我才得出它现在的样子。为什么？状态管理。

创建 `Message` 对象后，它与使用 `selector.register()` 监视事件的 socket 相关联：

```python
message = libserver.Message(sel, conn, addr)
sel.register(conn, selectors.EVENT_READ, data=message)
```

> 注意：本节中的一些代码示例来自服务器的主程序和 `Message` 类，但是本节和讨论同样适用于客户端。当客户端的代码不同时，我会展示并解释。

当 socket 上的事件就绪时，`selector.select()` 会返回它们。然后，我们可以使用 `key` 对象上的数据属性获取对 `Message` 对象的引用，并调用其中的方法：

```python
while True:
    events = sel.select(timeout=None)
    for key, mask in events:
        # ...
        message = key.data
        message.process_events(mask)
```

看上面的事件循环，你会看到 `sel.select()` 在驱动程序的位置上。它阻塞了，在循环的顶端等待事件。它负责在 socket 上准备好处理读和写事件时唤醒。这意味着，它也间接负责调用方法`process_events()`。当我说方法 `process_events()` 是入口点时，这就是我的意思。

让我们看看 `process_events()` 方法的作用：

```python
def process_events(self, mask):
    if mask & selectors.EVENT_READ:
        self.read()
    if mask & selectors.EVENT_WRITE:
        self.write()
```

这很好：`process_events()` 很简单。它只能做两件事：调用 `read()` 和 `write()`。

这让我们回到管理状态。经过几次重构，我决定，如果另一个方法依赖于具有特定值的状态变量，那么它们只能从 `read()` 和 `write()` 中调用。这使得逻辑尽可能简单，因为事件会进入 socket 进行处理。

这似乎是显而易见的，但是类的前几次迭代是检查当前状态的一些方法的组合，并根据它们的值调用其他方法来处理 `read()` 或 `write()` 之外的数据。最后，这被证明过于复杂，难以管理和维护。

你绝对应该修改这个类以适应你自己的需要，使它最适合你，但是我建议您保留状态检查和对依赖于该状态的方法的调用，如果可能的话，保留对 `read()` 和 `write()` 方法的调用。

让我们看看 `read()`。这是服务器的版本，但是客户端的版本是一样的。它只是使用不同的方法名，`process_response()`，而不是 `process_request()`：

```python
def read(self):
    self._read()

    if self._jsonheader_len is None:
        self.process_protoheader()

    if self._jsonheader_len is not None:
        if self.jsonheader is None:
            self.process_jsonheader()

    if self.jsonheader:
        if self.request is None:
            self.process_request()
```

首先调用 `_read()` 方法。它调用 `socket.recv()` 从 socket 读取数据并将其存储在接收缓冲区中。

请记住，当调用 `socket.recv()` 时，组成完整消息的所有数据可能还没有到达。可能需要再次调用 `socket.recv()`。这就是为什么在调用适当的方法来处理消息之前，会对消息的每个部分进行状态检查。

在一个方法处理它的消息部分之前，它首先检查以确保足够的字节已经被读入接收缓冲区。如果有，它会处理其各自的字节，从缓冲区中删除它们，并将输出写入下一个处理阶段使用的变量。由于消息有三个组件，因此有三个状态检查和 `process_` 方法调用：

| 消息组件  | 方法                    | 输出                   |
| --------- | ----------------------- | ---------------------- |
| 定长头部  | `process_protoheader()` | `self._jsonheader_len` |
| JSON 头部 | `process_jsonheader()`  | `self.jsonheader`      |
| 内容      | `process_request()`     | `self.request`         |

接下来，让我们看看 `write()`。这是服务器的版本：

```python
def write(self):
    if self.request:
        if not self.response_created:
            self.create_response()

    self._write()
```

`write()` 首先检查请求。如果存在，但尚未创建响应，则调用 `create_response()`。`create_response()` 设置状态变量 `response_created` 并将响应写入发送缓冲区。

如果发送缓冲区中有数据，则 `_write()` 方法调用 `socket.send()`。

请记住，当调用 `socket.send()` 时，发送缓冲区中的所有数据可能没有排队等待传输。socket 的网络缓冲区可能已满，可能需要再次调用 `socket.send()`。这就是为什么有状态检查。`create_response()` 只应被调用一次，但预计需要多次调用 `_write()`。

`write()` 的客户端版本类似：

```python
def write(self):
    if not self._request_queued:
        self.queue_request()

    self._write()

    if self._request_queued:
        if not self._send_buffer:
            # 设置 selector 来监听读事件，写已经完毕。
            self._set_selector_events_mask("r")
```

由于客户端启动到服务器的连接并首先发送请求，因此会检查状态变量 `_request_queued`。如果请求尚未排队，它会调用 `queue_request()`。`queue_request()` 创建请求并将其写入发送缓冲区。它还设置了状态变量 `_request_queued`，所以它只被调用一次。

就像服务器一样，`_write()` 调用 `socket.send()`，如果发送缓冲区中有数据的话。

客户端版本 `write()` 的显著区别是最后一次检查请求是否已经排队。这将在“客户端主程序”一节中详细解释，但其原因是告诉 `selector.select()` 停止监视 socket 的写事件。如果请求已经排队，并且发送缓冲区为空，那么我们就写完了，我们只对读事件感兴趣。没有理由被告知 socket 是可写的。

在结束这一节之前，我只想给你们留下一个想法。本节的主要目的是解释 `selector.select()` 通过 `process_events()` 方法调用 `Message` 类，并描述如何管理状态。

这一点很重要，因为 `process_events()` 将在连接生命周期中被调用多次。因此，确保只应调用一次的任何方法要么检查状态变量本身，要么由调用方检查方法设置的状态变量。

### 服务器主程序

在服务器的主程序 `app-server.py` 中，参数是从命令行读取的，该命令行指定要监听的接口和端口：

```shell
$ python ./app-server.py
usage: ./app-server.py <host> <port>
```

例如，要监听端口 65432 上的回环接口，请输入：

```shell
$ python ./app-server.py 127.0.0.1 65432
listening on ('127.0.0.1', 65432)
```

创建 socket 后，使用 `socket.SO_REUSEADDR` 选项调用 `socket.setsockopt()`：

```python
# 避免 bind() 异常: OSError: [Errno 48] Address already in use
lsock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
```

设置此 socket 选项可避免错误 `Address already in use`。当启动服务器时，您会看到这个，如果在同一端口上存在以前使用的 TCP socket 连接处于 [TIME_WAIT](http://www.serverframework.com/asynchronousevents/2011/01/time-wait-and-its-design-implications-for-protocols-and-scalable-servers.html) 状态。

例如，如果服务器主动关闭连接，它将保持 TIME_WAIT 状态两分钟或更长时间，具体取决于操作系统。如果您试图在 TIME_WAIT 状态到期之前再次启动服务器，您将会得到一个 `OSError` 异常 `Address already in use`。这是一种安全措施，确保网络中任何延迟的数据包不会被传送到错误的应用程序。

事件循环捕获任何错误，以便服务器能够保持正常运行：

```python
while True:
    events = sel.select(timeout=None)
    for key, mask in events:
        if key.data is None:
            accept_wrapper(key.fileobj)
        else:
            message = key.data
            try:
                message.process_events(mask)
            except Exception:
                print(
                    "main: error: exception for",
                    f"{message.addr}:\n{traceback.format_exc()}",
                )
                message.close()
```

接受客户端连接时，将创建一个 `Message` 对象：

```python
def accept_wrapper(sock):
    conn, addr = sock.accept()  # 应该可以读了
    print("accepted connection from", addr)
    conn.setblocking(False)
    message = libserver.Message(sel, conn, addr)
    sel.register(conn, selectors.EVENT_READ, data=message)
```

`Message` 对象与 `sel.register()` 调用中的 socket 相关联，最初被设置为仅监视读事件。一旦请求被读取，我们将修改它以仅侦听写事件。

在服务器中采用这种方法的一个优点是，在大多数情况下，当 socket 正常且没有网络问题时，它总是可写的。

如果我们让 `sel.register()` 也监视 `EVENT_WRITE`，事件循环会立即唤醒并通知我们这是事实。然而，此时，没有理由醒来并在 socket 上调用 `send()`。由于请求尚未处理，因此没有响应要发送。这将消耗和浪费宝贵的 CPU 周期。

### 服务器 Message 类

在“Message 入口点”一节中，我们看了当 socket 事件通过 `process_events()` 准备就绪时，如何调用 `Message` 对象来操作。现在让我们看看当数据在 socket 上被读取，并且消息的一个组件或部分准备好由服务器处理时会发生什么。

服务器的消息类在 `libserver.py` 中。你可以在 [GitHub](https://github.com/realpython/materials/tree/master/python-sockets-tutorial) 上找到源代码。

这些方法以消息处理的顺序出现在类中。

当服务器读取了至少 2 字节时，可以处理固定长度的头部：

```python
def process_protoheader(self):
    hdrlen = 2
    if len(self._recv_buffer) >= hdrlen:
        self._jsonheader_len = struct.unpack(">H", self._recv_buffer[:hdrlen])[0]
        self._recv_buffer = self._recv_buffer[hdrlen:]
```

固定长度头部是网络字节顺序的 2 字节整数（big-endian），包含 JSON 头部的长度。[`struct.unpack()`](https://docs.python.org/3/library/struct.html)用于读取值、解码值并将其存储在 `self._jsonheader_len` 中。处理完它负责的消息后，`process_protoheader()` 将它从接收缓冲区中删除。

就像固定长度的头部一样，当接收缓冲区中有足够的数据包含 JSON 头部时，它也可以被处理：

```python
def process_jsonheader(self):
    hdrlen = self._jsonheader_len
    if len(self._recv_buffer) >= hdrlen:
        self.jsonheader = self._json_decode(self._recv_buffer[:hdrlen], "utf-8")
        self._recv_buffer = self._recv_buffer[hdrlen:]
        for reqhdr in (
            "byteorder",
            "content-length",
            "content-type",
            "content-encoding",
        ):
            if reqhdr not in self.jsonheader:
                raise ValueError(f'Missing required header "{reqhdr}".')
```

调用 `self._json_decode()` 方法对 JSON 头部进行解码并将其反序列化为字典。由于 JSON 头部被定义为 UTF-8 编码的 Unicode，因此在调用中对 `utf-8` 进行了硬编码。结果被保存到 `self.jsonheader` 中。在处理完它所负责的消息之后，`process_jsonheader()` 将它从接收缓冲区中删除。

接下来是消息的实际内容（或载荷）。它由 `self.jsonheader` 中的 JSON 头部描述。当 `content-length` 字节在接收缓冲区中可用时，可以处理请求：

```python
def process_request(self):
    content_len = self.jsonheader["content-length"]
    if not len(self._recv_buffer) >= content_len:
        return
    data = self._recv_buffer[:content_len]
    self._recv_buffer = self._recv_buffer[content_len:]
    if self.jsonheader["content-type"] == "text/json":
        encoding = self.jsonheader["content-encoding"]
        self.request = self._json_decode(data, encoding)
        print("received request", repr(self.request), "from", self.addr)
    else:
        # 二进制或未知的 content-type
        self.request = data
        print(f'received {self.jsonheader["content-type"]} request from', self.addr)
    # 将 selector 设置为侦听写入事件，我们完成了读取。
    self._set_selector_events_mask("w")
```

将消息内容保存到数据变量后，`process_request()` 会将其从接收缓冲区中删除。然后，如果内容类型是 JSON，它会解码并反序列化它。如果不是，对于这个示例应用程序，它假设它是一个二进制请求，并简单地打印内容类型。

`process_request()` 做的最后一件事是修改 `selector` 以仅监视写入事件。在服务器的主程序 `app-server.py` 中，socket 最初被设置为仅监视读事件。既然请求已经完全处理完毕，我们对读取不再感兴趣。

现在可以创建响应并将其写入 socket。当 socket 可写时，从 `write()` 调用 `create_response()`：

```python
def create_response(self):
    if self.jsonheader["content-type"] == "text/json":
        response = self._create_response_json_content()
    else:
        # 二进制或未知的 content-type
        response = self._create_response_binary_content()
    message = self._create_message(**response)
    self.response_created = True
    self._send_buffer += message
```

根据内容类型，通过调用其他方法创建响应。在这个示例程序中，当 `action == 'search'` 时，为 JSON 请求执行简单的字典查找。您可以为自己的应用程序定义在此调用的其他方法。

创建响应消息后，状态变量 `self.response_created` 被设置，因此 `write()` 不再调用 `create_response()`。最后，响应被附加到发送缓冲区。这是由 `_write()` 看到并发送的。

一个棘手的问题是如何在响应被写入后关闭连接。我在方法 `_write()` 中调用 `close()`：

```python
def _write(self):
    if self._send_buffer:
        print("sending", repr(self._send_buffer), "to", self.addr)
        try:
            # 应该可以写了
            sent = self.sock.send(self._send_buffer)
        except BlockingIOError:
            # 资源暂时不可用（errno EWOULDBLOCK）
            pass
        else:
            self._send_buffer = self._send_buffer[sent:]
            # 缓冲区为空时关闭。响应已经发出
            if sent and not self._send_buffer:
                self.close()
```

虽然有点“被隐藏”的感觉，但我认为这是一个可以接受的折衷，因为 `Message` 类只处理一个连接的一条消息。写完响应后，服务器就没有什么可做的了。它已经完成了它的工作。

### 客户端主程序

在客户端的主程序 `app-client.py` 中，参数是从命令行读取的，用于创建请求和启动到服务器的连接：

```shell
$ python ./app-client.py
usage: ./app-client.py <host> <port> <action> <value>
```

这里有一个例子：

```shell
$ python ./app-client.py 127.0.0.1 65432 search needle
```

从命令行参数创建表示请求的字典后，主机、端口和请求字典被传递给 `start_connection()`：

```python
def start_connection(host, port, request):
    addr = (host, port)
    print("starting connection to", addr)
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setblocking(False)
    sock.connect_ex(addr)
    events = selectors.EVENT_READ | selectors.EVENT_WRITE
    message = libclient.Message(sel, sock, addr, request)
    sel.register(sock, events, data=message)
```

使用请求字典为服务器连接以及 `Message` 对象创建 socket。

像服务器一样，`Message` 对象与 `sel.register()` 调用中的 socket 相关联。但是，对于客户端来说，socket 最初被设置为针对读和写事件进行监视。一旦请求被写完，我们将修改它，只监听读事件。

这种方法给了我们与服务器相同的优势：不浪费 CPU 周期。发送请求后，我们对写事件不再感兴趣，因此没有理由醒来处理它们。

### 客户端 Message 类

在“`Message` 入口点”一节中，我们看了当 socket 事件通过 `process_events()` 准备就绪时，如何调用 `Message` 对象来操作。现在让我们看看在 socket 上读取和写入数据以及客户端准备好处理消息之后会发生什么。

客户端的消息类在 `libclient.py` 中。您可以在 [GitHub](https://github.com/realpython/materials/tree/master/python-sockets-tutorial) 上找到源代码。

这些方法以消息处理的顺序出现在类中。

客户端的第一项任务是将请求排队：

```python
def queue_request(self):
    content = self.request["content"]
    content_type = self.request["type"]
    content_encoding = self.request["encoding"]
    if content_type == "text/json":
        req = {
            "content_bytes": self._json_encode(content, content_encoding),
            "content_type": content_type,
            "content_encoding": content_encoding,
        }
    else:
        req = {
            "content_bytes": content,
            "content_type": content_type,
            "content_encoding": content_encoding,
        }
    message = self._create_message(**req)
    self._send_buffer += message
    self._request_queued = True
```

根据命令行上传递的内容，用于创建请求的字典位于客户端的主程序 `app-client.py` 中。创建 `Message` 对象时，请求字典作为参数传递给类。

请求消息被创建并附加到发送缓冲区，然后由 `_write()` 看到并发送。状态变量 `self._request_queued` 已设置，因此不再调用 `queue_request()`。

发送请求后，客户端等待服务器的响应。

客户端读取和处理消息的方法与服务器相同。当从 socket 读取响应数据时，`process` 头部方法被称为：`process_protoheader()` 和 `process_jsonheader()`。

不同之处在于 `process` 方法的命名以及它们正在处理一个响应，而不是创建一个响应：`process_response()`，`_process_response_json_content()`，和 `_process_response_binary_content()`。

最后，当然也并非最不重要的是，在对 `process_response()` 的调用的最后：

```python
def process_response(self):
    # ...
    # 处理响应后关闭
    self.close()
```

### Message 类总结

在结束对 `Message` 类的讨论时，我将提到几个需要注意的重要事项，以及一些支持方法。

类引发的任何异常都会被主程序的 `except` 子句捕获：

```python
try:
    message.process_events(mask)
except Exception:
    print(
        "main: error: exception for",
        f"{message.addr}:\n{traceback.format_exc()}",
    )
    message.close()
```

注意最后一行：`message.close()`。

这是非常重要的一行，原因不止一个！它不仅确保 socket 是关闭的，而且 `message.close()` 也将 socket 从 `select()` 的监视中移除。这大大简化了类中的代码，降低了复杂性。如果有异常或者我们自己明确抛出一个异常，我们知道 `close()` 会负责清理。

方法 `Message._read()` 和 `Message._write()` 还包含一些有趣的内容：

```python
def _read(self):
    try:
        # 应该可以读了
        data = self.sock.recv(4096)
    except BlockingIOError:
        # 资源暂时不可用（errno EWOULDBLOCK）
        pass
    else:
        if data:
            self._recv_buffer += data
        else:
            raise RuntimeError("Peer closed.")
```

注意 `except` 行：`except BlockingIOError:`。

`_write()` 也有一个。这些行很重要，因为它们捕获暂时的错误并使用 `pass` 跳过它。暂时的错误是当 socket 会阻塞时，例如，如果它正在等待网络或连接的另一端（它的对等端）。

通过用 `pass` 捕捉并跳过异常，`select()` 最终将再次调用我们，我们将获得另一次读取或写入数据的机会。

### 运行应用客户端和服务器

经过这些艰苦的工作，让我们玩得开心点，进行一些搜索吧！

在这些示例中，我将运行服务器，以便它通过为 host 参数传递空字符串来侦听所有接口。这将允许我运行客户端并从另一个网络上的虚拟机连接。它模拟一台大端 PowerPC 机器。

首先，让我们启动服务器：

```shell
$ python ./app-server.py '' 65432
listening on ('', 65432)
```

现在让我们运行客户端并输入搜索内容。让我们看看是否能找到他：

```shell
$ python ./app-client.py 10.0.1.1 65432 search morpheus
starting connection to ('10.0.1.1', 65432)
sending b'\x00d{"byteorder": "big", "content-type": "text/json", "content-encoding": "utf-8", "content-length": 41}{"action": "search", "value": "morpheus"}' to ('10.0.1.1', 65432)
received response {'result': 'Follow the white rabbit. 🐰'} from ('10.0.1.1', 65432)
got result: Follow the white rabbit. 🐰
closing connection to ('10.0.1.1', 65432)
```

我的终端正在运行一个使用 Unicode（UTF-8）文本编码的 shell，所以上面的输出很好地打印了表情符号。

让我们看看是否能找到小狗：

```shell
$ python ./app-client.py 10.0.1.1 65432 search 🐶
starting connection to ('10.0.1.1', 65432)
sending b'\x00d{"byteorder": "big", "content-type": "text/json", "content-encoding": "utf-8", "content-length": 37}{"action": "search", "value": "\xf0\x9f\x90\xb6"}' to ('10.0.1.1', 65432)
received response {'result': '🐾 Playing ball! 🏐'} from ('10.0.1.1', 65432)
got result: 🐾 Playing ball! 🏐
closing connection to ('10.0.1.1', 65432)
```

注意在发送行中请求通过网络发送的字节串。您可以更容易地找到以十六进制打印的表示小狗表情符号的字节：`\xf0\x9f\x90\xb6`。我能够输入表情符号，因为我的终端使用的是 UTF-8 编码的 Unicode。

这表明我们正在通过网络发送原始字节，它们需要被接收器解码才能被正确解释。这就是为什么我们费了很大的劲来创建一个包含内容类型和编码的标题。

以下是上述两个客户端连接的服务器输出：

```shell
accepted connection from ('10.0.2.2', 55340)
received request {'action': 'search', 'value': 'morpheus'} from ('10.0.2.2', 55340)
sending b'\x00g{"byteorder": "little", "content-type": "text/json", "content-encoding": "utf-8", "content-length": 43}{"result": "Follow the white rabbit. \xf0\x9f\x90\xb0"}' to ('10.0.2.2', 55340)
closing connection to ('10.0.2.2', 55340)

accepted connection from ('10.0.2.2', 55338)
received request {'action': 'search', 'value': '🐶'} from ('10.0.2.2', 55338)
sending b'\x00g{"byteorder": "little", "content-type": "text/json", "content-encoding": "utf-8", "content-length": 37}{"result": "\xf0\x9f\x90\xbe Playing ball! \xf0\x9f\x8f\x90"}' to ('10.0.2.2', 55338)
closing connection to ('10.0.2.2', 55338)
```

查看 `sending` 行以查看写入客户端 socket 的字节。这是服务器的响应消息。

如果 `action` 参数不是 `search`，您也可以测试向服务器发送二进制请求：

```shell
$ python ./app-client.py 10.0.1.1 65432 binary 😃
starting connection to ('10.0.1.1', 65432)
sending b'\x00|{"byteorder": "big", "content-type": "binary/custom-client-binary-type", "content-encoding": "binary", "content-length": 10}binary\xf0\x9f\x98\x83' to ('10.0.1.1', 65432)
received binary/custom-server-binary-type response from ('10.0.1.1', 65432)
got response: b'First 10 bytes of request: binary\xf0\x9f\x98\x83'
closing connection to ('10.0.1.1', 65432)
```

由于请求的 `content-type` 不是 `text/json`，服务器将其视为自定义二进制类型，不执行 JSON 解码。它只是打印 `content-type`，并将前 10 个字节返回给客户端：

```shell
$ python ./app-server.py '' 65432
listening on ('', 65432)
accepted connection from ('10.0.2.2', 55320)
received binary/custom-client-binary-type request from ('10.0.2.2', 55320)
sending b'\x00\x7f{"byteorder": "little", "content-type": "binary/custom-server-binary-type", "content-encoding": "binary", "content-length": 37}First 10 bytes of request: binary\xf0\x9f\x98\x83' to ('10.0.2.2', 55320)
closing connection to ('10.0.2.2', 55320)
```

## 问题处理

不可避免的是，有些东西不起作用，你会想知道该怎么办。别担心，这发生在我们所有人身上。希望在本教程、调试器和最喜欢的搜索引擎的帮助下，您能够再次使用源代码部分。

如果没有，你的第一站应该是 Python 的 [socket 模块](https://docs.python.org/3/library/socket.html)文档。确保您阅读了您调用的每个函数或方法的所有文档。此外，阅读参考部分。特别是，检查“错误”部分。

有时候，这不仅仅是关于源代码。源代码可能是正确的，它只是另一台主机，客户端或服务器的问题。或者它可能是网络，例如路由器、防火墙，或者其他中间人的网络设备。

对于这些类型的问题，额外的工具是必不可少的。下面是一些工具和实用程序，可能会有所帮助或者至少提供一些线索。

### ping

`ping` 将通过发送 [ICMP](https://en.wikipedia.org/wiki/Internet_Control_Message_Protocol) Echo 请求来检查主机是否处于活动状态并连接到网络。它直接与操作系统的 TCP / IP 协议栈通信，因此它独立于主机上运行的任何应用程序工作。

下面是在 macOS 上运行 `ping` 的示例：

```shell
$ ping -c 3 127.0.0.1
PING 127.0.0.1 (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.036 ms
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.102 ms
64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.082 ms

--- 127.0.0.1 ping statistics ---
3 packets transmitted, 3 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 0.036/0.073/0.102/0.028 ms
```

注意输出末尾的统计信息。当您试图发现间歇性连接问题时，这可能会有所帮助。例如，是否有任何数据包丢失？等待时间有多长（见往返时间）？

如果你和另一台主机之间有防火墙，`ping` 的 Echo 请求可能不被允许。一些防火墙管理员实施强制执行此操作的策略。想法是他们不希望他们的主机被发现。如果是这种情况，并且您添加了防火墙规则来允许主机通信，请确保这些规则也允许 ICMP 在它们之间传递。

ICMP 是 `ping` 使用的协议，但它也是 TCP 和其他低级协议用来传递错误消息的协议。如果你正在经历奇怪的行为或缓慢的连接，这可能是原因。

ICMP 消息由类型和代码标识。为了让你了解他们携带的重要信息，这里有几个：

| ICMP 类型 | ICMP 代码 | 描述                         |
| --------- | --------- | ---------------------------- |
| 8         | 0         | Echo 请求                    |
| 0         | 0         | Echo 响应                    |
| 3         | 0         | 目标网络不可达               |
| 3         | 1         | 目标主机不可达               |
| 3         | 2         | 目标协议不可达               |
| 3         | 3         | 目标端口不可达               |
| 3         | 4         | 需要分片，并且设置了 DF 标志 |
| 11        | 0         | TTL 在运输途中过期           |

有关分片和 ICMP 消息的信息，请参阅 [Path MTU 发现](https://en.wikipedia.org/wiki/Path_MTU_Discovery#Problems_with_PMTUD)一文。这是一个例子，可以引起我前面提到的奇怪行为。

### netstat

在查看 socket 状态一节中，我们研究了如何使用 netstat 显示有关 socket 及其当前状态的信息。该实用程序可在 macOS、Linux 和 Windows 上使用。

在示例输出中，我没有提到 `Recv-Q` 和 `Send-Q` 列。这些列将显示排队等待传输或接收的网络缓冲区中保留的字节数，但由于某种原因，远程或本地应用程序尚未读取或写入这些字节数。

换句话说，字节在操作系统队列中的网络缓冲区中等待。原因之一可能是应用程序受 CPU 限制，或者无法调用 `socket.recv()` 或 `socket.send()` 来处理字节。或者可能存在影响通信的网络问题，如拥塞或网络硬件或电缆故障。

为了演示这一点并查看在看到错误之前我可以发送多少数据，我编写了一个连接到测试服务器并重复调用 `socket.send()` 的测试客户端。测试服务器从不调用 `socket.recv()`。它只是接受连接。这会导致服务器上的网络缓冲区被填满，这最终会在客户端引发错误。

首先，我启动了服务器：

```shell
$ python ./app-server-test.py 127.0.0.1 65432
listening on ('127.0.0.1', 65432)
```

然后我运行客户端。让我们看看错误是什么：

```shell
$ python ./app-client-test.py 127.0.0.1 65432 binary test
error: socket.send() blocking io exception for ('127.0.0.1', 65432):
BlockingIOError(35, 'Resource temporarily unavailable')
```

以下是客户端和服务器仍在运行时的 netstat 输出，客户端多次打印错误消息：

```shell
$ netstat -an | grep 65432
Proto Recv-Q Send-Q  Local Address          Foreign Address        (state)
tcp4  408300      0  127.0.0.1.65432        127.0.0.1.53225        ESTABLISHED
tcp4       0 269868  127.0.0.1.53225        127.0.0.1.65432        ESTABLISHED
tcp4       0      0  127.0.0.1.65432        *.*                    LISTEN
```

第一个条目是服务器（`Local` 地址具有端口 65432）：

```shell
Proto Recv-Q Send-Q  Local Address          Foreign Address        (state)
tcp4  408300      0  127.0.0.1.65432        127.0.0.1.53225        ESTABLISHED
```

请注意 `Recv-Q: 408300`。

第二个条目是客户端（`Foreign` 地址具有端口 65432）：

```shell
Proto Recv-Q Send-Q  Local Address          Foreign Address        (state)
tcp4       0 269868  127.0.0.1.53225        127.0.0.1.65432        ESTABLISHED
```

请注意 `Send-Q: 269868`。

客户端确实试图写入字节，但是服务器没有读取它们。这导致服务器的网络缓冲队列在接收端填满，客户端的网络缓冲队列在发送端填满。

### Windows

如果你使用 Windows，有一套实用工具，如果你还没有，你绝对应该去看看：[Windows Sysinternals](https://docs.microsoft.com/en-us/sysinternals/)。

其中之一是 TCPView.exe。TCPView 是 Windows 的图形版 netstat。除了地址、端口号和 socket 状态之外，它还将显示发送和接收的数据包和字节数的运行总数。像 Unix 实用程序 lsof 一样，您也可以获得进程名称和 ID。检查菜单中的其他显示选项。

### Wireshark

有时你需要看看线路上发生了什么。忘记应用程序日志的内容，或者从库调用返回的值。您希望看到网络上实际发送或接收的内容。就像调试器一样，当你需要看到它时，没有任何替代品。

[Wireshark](https://www.wireshark.org/) 是一个网络协议分析器和流量捕获应用程序，运行在 macOS、Linux 和 Windows 等设备上。有一个名为 `wireshark` 的 GUI 版本，还有一个名为 `tshark` 的终端版本。

运行流量捕获是观察应用程序在网络上的行为的一个很好的方法，可以收集关于它发送和接收什么以及频率和数量的证据。您还可以看到客户端或服务器何时关闭或中止连接或停止响应。当您进行故障排除时，这些信息会非常有用。

网络上有许多很好的教程和其他资源，可以帮助你了解使用 Wireshark 和 TShark 的基本知识。

## 参考

这一节作为参考，提供了额外的信息和指向外部资源的链接。

### Python 文档

- Python [socket 模块](https://docs.python.org/3/library/socket.html)
- Python [Socket Programming HOWTO](https://docs.python.org/3/howto/sockets.html#socket-howto)

### 错误

以下来自 Python 的 socket 模块文档：

> “所有错误都会引发异常。可以引发无效参数类型和内存不足的正常异常；从 Python 3.3 开始，与 socket 或地址语义相关的错误会引发 `OSError` 或其子类之一。”（[来源](https://docs.python.org/3/library/socket.html)）

使用 socket 时可能会遇到以下常见错误：

| 异常                     | errno 常量     | 描述                                                                                                                                                                         |
| ------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BlockingIOError`        | `EWOULDBLOCK`  | 资源暂时不可用。例如，在非阻塞模式下，当调用 `send()` 并且对等方忙而不读时，发送队列（网络缓冲区）已满。或者网络有问题。期望这只是暂时的情况。                               |
| `OSError`                | `EADDRINUSE`   | 地址已在使用中。确保没有其他正在运行的进程使用相同的端口号，并且您的服务器设置了 socket 选项：`SO_REUSEADDR`: `socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)` |
| `ConnectionResetError`   | `ECONNRESET`   | 对等方重置连接。远程进程崩溃或没有正确关闭其 socket（不干净的关闭）。或者网络路径中有一个防火墙或其他设备缺少规则或行为不当。                                                |
| `TimeoutError`           | `ETIMEDOUT`    | 操作超时。对等方没有回应。                                                                                                                                                   |
| `ConnectionRefusedError` | `ECONNREFUSED` | 连接被拒绝。没有应用程序侦听指定端口。                                                                                                                                       |

### Socket 地址族

`socket.AF_INET` 和 `socket.AF_INET6` 表示用于 `socket.socket()` 的第一个参数的地址和协议族。 使用地址的 API 期望它采用某种格式，具体取决于 socket 是使用 `socket.AF_INET` 还是 `socket.AF_INET6` 创建的。

| 地址族            | 协议 | 地址元组                          | 描述                                                                                                                                                                                                                  |
| ----------------- | ---- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `socket.AF_INET`  | IPv4 | `(host, port)`                    | `host` 是具有主机名的字符串，例如 `'www.example.com'` 或者 IPv4 地址 `'10.1.2.3'`，`port` 是整数。                                                                                                                    |
| `socket.AF_INET6` | IPv6 | `(host, port, flowinfo, scopeid)` | `host` 是具有主机名的字符串，例如 `'www.example.com'` 或者 IPv6 地址 `'fe80::6203:7ab:fe88:9c23'`，`port` 是整数，`flowinfo` 和 `scopeid` 表示 C 结构体 `sockaddr_in6` 中的 `sin6_flowinfo` 和 `sin6_scope_id` 成员。 |

注意 Python socket 模块文档中关于地址元组的主机值的摘录：

> 对于 IPv4 地址，接受两种特殊形式而不是主机地址：空字符串代表 `INADDR_ANY`，字符串 `'<broadcast>'` 代表 `INADDR_BROADCAST`。这种行为与 IPv6 不兼容，因此，如果您打算用 Python 程序支持 IPv6，您可能希望避免这些行为。（[来源](https://docs.python.org/3/library/socket.html)）

有关详细信息，请参阅 Python 的[ socket 系列](https://docs.python.org/3/library/socket.html#socket-families)文档。

我在本教程中使用了 IPv4 socket，但是如果您的网络支持，尽可能尝试测试和使用 IPv6。支持这一点的一个简单方法是使用函数 [`socket.getaddrinfo()`](https://docs.python.org/3/library/socket.html#socket.getaddrinfo)。它将主机和端口参数转换成包含创建连接到该服务的 socket 所需的所有参数的 5 元组序列。除了 IPv4 之外，`socket.getaddrinfo()` 将理解和解释传入的 IPv6 地址并解析为 IPv6 地址的主机名。

以下示例返回端口 80 上到 example.org 的 TCP 连接的地址信息：

```python
>>> socket.getaddrinfo("example.org", 80, proto=socket.IPPROTO_TCP)
[(<AddressFamily.AF_INET6: 10>, <SocketType.SOCK_STREAM: 1>,
 6, '', ('2606:2800:220:1:248:1893:25c8:1946', 80, 0, 0)),
 (<AddressFamily.AF_INET: 2>, <SocketType.SOCK_STREAM: 1>,
 6, '', ('93.184.216.34', 80))]
```

如果未启用 IPv6，系统上的结果可能会有所不同。上面返回的值可以通过将它们传递给 `socket.socket()` 和 `socket.connect()` 来使用。Python socket 模块文档的示例部分中有一个客户端和服务器示例。

### 使用主机名

对于本文，当您打算使用回环接口“localhost”时，本节主要适用于使用带有 `bind()` 和 `connect()` 或 `connect_ex()` 的主机名。但是，它适用于任何时候使用主机名，并且期望它解析到某个地址，并且对影响其行为或假设的应用程序具有特殊意义。这与客户端使用主机名连接到由 DNS 解析的服务器（如 www.example.com）的典型场景形成对比。

以下是 Python 的 socket 模块文档：

> 如果在 IPv4 / v6 socket 地址的主机部分使用主机名，程序可能会显示不确定性行为，因为 Python 使用从 DNS 解析返回的第一个地址。Socket 地址将以不同方式解析为实际的 IPv4 / v6 地址，具体取决于 DNS 解析和 / 或主机配置的结果。对于确定性行为，在主机部分使用数字地址。（[来源](https://docs.python.org/3/library/socket.html)）

名称“localhost”的标准约定是将其解析为 `127.0.0.1` 或 `::1`，回环接口。这很可能是你系统上的情况，但也许不是。这取决于您的系统如何配置名称解析。就像所有事情一样，总是有例外，并且不能保证使用“localhost”这个名字会连接到回环接口。

例如，在 Linux 上，请参见 `man nsswitch.conf`，名称服务交换机配置文件。在 macOS 和 Linux 上检查的另一个地方是文件 `/etc/hosts`。在 Windows 上，请参见 `C:\Windows\System32\drivers\etc\hosts`。hosts 文件包含一个简单文本格式的静态名称到地址映射表。[DNS](https://en.wikipedia.org/wiki/Domain_Name_System) 是另一个难题。

有趣的是，在这篇文章（2018 年 6 月）中，有一个 RFC 草案[让“local host”成为 localhost](https://tools.ietf.org/html/draft-ietf-dnsop-let-localhost-be-localhost-02)，讨论了使用“localhost”这个名字的约定、假设和安全性。

重要的是要理解，当你在应用程序中使用主机名时，返回的地址实际上可以是任何东西。如果你有一个安全敏感的应用程序，不要对名字做出假设。根据您的应用程序和环境，这可能是也可能不是您关心的问题。

> 注意：安全预防措施和最佳实践仍然适用，即使您的应用程序不是“安全敏感的”。如果您的应用程序访问网络，它应该得到保护和维护。这意味着，至少：
>
> - 定期应用系统软件更新和安全补丁，包括 Python。你在使用第三方库吗？如果是这样的话，确保也检查和更新了这些。
> - 如果可能，请使用专用或基于主机的防火墙来限制与受信任系统的连接。
> - 配置了哪些 DNS 服务器？你信任他们和他们的管理者吗？
> - 在调用处理请求数据的其他代码之前，确保尽可能多地对其进行清理和验证。为此使用（模糊）测试并定期运行它们。

不管您是否使用主机名，如果您的应用程序需要支持安全连接（加密和身份验证），您可能需要考虑使用 [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security)。这是它自己独立的主题，超出了本教程的范围。请参阅 Python 的 [SSL 模块](https://docs.python.org/3/library/ssl.html)文档以开始。这与您的 Web 浏览器用来安全连接网站的协议相同。

考虑到接口、IP 地址和名称解析，有许多变量。你该怎么办？以下是一些建议，如果您没有网络应用程序审查流程，可以使用这些建议：

| 应用   | 使用       | 建议                                                                                                 |
| ------ | ---------- | ---------------------------------------------------------------------------------------------------- |
| Server | 回环接口   | 使用 IP 地址，例如 `127.0.0.1` 或者 `::1`                                                            |
| Server | 以太网接口 | 使用 IP 地址，例如 `10.1.2.3`。要支持多个接口，请对所有接口/地址使用空字符串。请参见上面的安全说明。 |
| Client | 回环接口   | 使用 IP 地址，例如 `127.0.0.1` 或者 `::1`                                                            |
| Client | 以太网接口 | 使用 IP 地址以实现一致性和不依赖名称解析。对于典型情况，请使用主机名。请参见上面的安全说明。         |

对于客户端或服务器，如果您需要验证所连接的主机，请考虑使用 TLS。

### 阻塞调用

暂时挂起应用程序的 socket 函数或方法是阻塞调用。例如，`accept()`，`connect()`，`send()`，和 `recv()`。他们不会马上返回。阻塞调用必须等待系统调用（I/O）完成，然后才能返回值。所以你，调用者，会被阻止，直到他们结束或者超时或者其他错误发生。

阻塞 socket 调用可以设置为非阻塞模式，以便立即返回。如果您这样做，至少需要重构或重新设计应用程序，以便在 socket 操作就绪时处理它。

由于调用立即返回，因此数据可能尚未就绪。 被调用者正在网络上等待，没有时间完成其工作。 如果是这种情况，则当前状态为 `errno` 值 `socket.EWOULDBLOCK`。 [`setblocking()`](https://docs.python.org/3/library/socket.html#socket.socket.setblocking) 支持非阻塞模式。

默认情况下，socket 总是在阻塞模式下创建的。有关这三种模式的描述，请参见关于 [socket 超时](https://docs.python.org/3/library/socket.html#notes-on-socket-timeouts)的文档。

### 关闭连接

有一点值得注意的是，在 TCP 中，客户端或服务器完全可以合法地关闭连接的一端，而另一端则保持打开状态。这被称为“半开”连接。这是否可取取决于应用程序的决定。一般来说，它不是。在这种状态下，关闭连接端的一方不能再发送数据。他们只能接受。

我并不主张您采用这种方法，但是作为示例，HTTP 使用一个名为“Connection”的头部，用于标准化应用程序应该如何关闭或持久化打开的连接。有关详细信息，请参阅 [RFC 7230，超文本传输协议（HTTP/1.1）中的 6.3 节：消息语法和路由](https://tools.ietf.org/html/rfc7230#section-6.3)。

在设计和编写应用程序及其应用层协议时，最好继续研究如何关闭连接。有时这是显而易见的和简单的，或者是一些需要一些初始原型和测试的东西。这取决于应用程序以及消息循环如何处理其预期的数据。只要确保在完成工作后，socket 总是及时关闭。

### 字节序

有关不同 CPU 如何在内存中存储字节序的详细信息，请参见[维基百科](https://en.wikipedia.org/wiki/Endianness)关于字节序的文章。解释单个字节时，这不是问题。但是，当处理作为单个值读取和处理的多个字节时，例如 4 字节整数，如果您与使用不同顺序的机器通信，则需要颠倒字节顺序。

字节顺序对于表示为多字节序列的文本字符串（如 Unicode）也很重要。除非您总是使用“正确的”，严格的 [ASCII](https://en.wikipedia.org/wiki/ASCII) 并控制客户端和服务器的实现，否则最好使用 Unicode 编码，如 UTF-8 或支持[字节顺序标记](https://en.wikipedia.org/wiki/Byte_order_mark)（BOM）的编码。

显式定义应用层协议中使用的编码非常重要。为此，您可以要求所有文本都是 UTF-8，或者使用指定编码的“content-encoding”头部。这可以防止应用程序必须检测编码，如果可能，应该避免这种情况。

当涉及的数据存储在文件或数据库中，并且没有指定编码的元数据时，这就成了问题。当数据被传输到另一个端点时，它必须尝试检测编码。有关讨论，请参见[维基百科](https://en.wikipedia.org/wiki/Unicode)引用的文章 [RFC 3629: UTF-8 的 Unicode，ISO 10646 的一种转换格式](https://tools.ietf.org/html/rfc3629#page-6)：

> 然而，UTF-8 标准 RFC 3629 建议禁止在使用 UTF-8 的协议中使用字节顺序标记，但讨论了这可能无法实现的情况。此外，对 UTF-8 中对可能模式有巨大限制（例如，高位集不能有任何单独的字节），这意味着应该可以在不依赖 BOM 的情况下将 UTF-8 与其他字符编码区分开。（[来源](https://en.wikipedia.org/wiki/Unicode)）

由此得出的结论是，如果应用程序处理的数据可能发生变化，则始终存储用于数据的编码。换句话说，如果编码不总是 UTF-8 或 BOM 的其他编码，那么尝试以某种方式将编码存储为元数据。然后，您可以将该编码与数据一起发送到头部中，以告诉接收者它是什么。

TCP / IP 中使用的字节顺序是[大字节序](https://en.wikipedia.org/wiki/Endianness#Big)，称为网络顺序。网络顺序用于表示协议栈较低层的整数，如 IP 地址和端口号。Python 的 socket 模块包括将整数转换成网络和主机字节顺序的函数：

| 函数              | 描述                                                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `socket.ntohl(x)` | 将 32 位正整数从网络转换为主机字节顺序。在主机字节顺序与网络字节顺序相同的机器上，这是无效操作；否则，它会执行 4 字节交换操作。         |
| `socket.ntohs(x)` | 将 16 位正整数从网络转换为主机字节顺序。在主机字节顺序与网络字节顺序相同的机器上，这是无效操作；否则，它会执行 2 字节交换操作。         |
| `socket.htonl(x)` | 将 32 位正整数从主机字节顺序转换为网络字节顺序。在主机字节顺序与网络字节顺序相同的机器上，这是无效操作；否则，它会执行 4 字节交换操作。 |
| `socket.htons(x)` | 将 16 位正整数从主机字节顺序转换为网络字节顺序。在主机字节顺序与网络字节顺序相同的机器上，这是无效操作；否则，它会执行 2 字节交换操作。 |

您也可以使用 [struct 模块](https://docs.python.org/3/library/struct.html)使用格式字符串打包和解压缩二进制数据：

```python
import struct
network_byteorder_int = struct.pack('>H', 256)
python_int = struct.unpack('>H', network_byteorder_int)[0]
```

## 总结

在本教程中，我们讨论了很多问题。网络和 socket 是很大的主题。如果你是网络或 socket 的新手，不要被所有的术语和首字母缩略词吓退。

为了理解每件事是如何协同工作的，有很多东西需要熟悉。然而，就像 Python 一样，随着你了解各个部分并花更多的时间与它们相处，它将开始变得更有意义。

我们查看了 Python socket 模块中的低级 socket API，并了解了如何使用它来创建客户端-服务器应用程序。我们还创建了自己的定制类，并将其用作应用层协议，在端点之间交换消息和数据。你可以使用这个类，并在它的基础上学习和帮助创建你自己的 socket 应用程序。

你可以在 [GitHub](https://github.com/realpython/materials/tree/master/python-sockets-tutorial) 上找到源代码。

祝贺你成功了！现在，您已经在自己的应用程序中使用 socket 了。

我希望本教程已经给了你开始你的 socket 开发之旅所需的信息、例子和灵感。
