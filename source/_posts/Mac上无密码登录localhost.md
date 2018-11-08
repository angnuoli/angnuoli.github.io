---
title: Connect to localhost without password using SSH on Mac
date: 2018-09-09 22:22:51
tags:
  - hadoop
  - trouble shooting
---

最近在 Mac 上搭 Hadoop 环境，运行 start-dfs.sh 时遇到一个问题

```bash
/usr/local/Cellar/hadoop/3.1.1/libexec/sbin/start-dfs.sh 
```

即无法通过 ssh 免密码（通过 pub-private key pair）登录到 localhost

```
Starting namenodes on [localhost]
localhost: user@localhost: Permission denied (publickey,password,keyboard-interactive).
Starting datanodes
localhost: user@localhost: Permission denied (publickey,password,keyboard-interactive).
```

查了一圈没找到 Solution，最后才摸索出了解决方法。

<!--more-->

以下是解决方法。

## 设置允许远程登录

首先设置 System Preference -> Sharing -> Remote Login

## 设置 SSH 免密

可以 type in terminal 测试一下是否需要密码

```bash
ssh localhost 
```

需要密码则是导致上述错误发生的原因。

解决方案是

1. 在 `~/.ssh` 目录下生成一对 rsa key pair

   ```bash
   ssh-keygen -t rsa
   ```

2. 添加到 authorized_keys 中

   ```bash
   cat id_rsa.pub >> authorized_keys
   ```

3. **在 `.ssh/config` 文件中添加生成的 private key（这步我看许多 help 中都没有提及，不知道是不是我这边特有的情况，不过这的确解决了问题）**

   ```bash
   Host *
    IdentityFile ~/.ssh/id_rsa
   ```

现在在去 start hdfs 就可以成功了。

