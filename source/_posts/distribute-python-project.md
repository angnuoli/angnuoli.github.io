---
title: Distribute Python project with environment
date: 2018-11-08 11:58:42
tags: 
  - python
  - conda
  - pip
---

转手项目的时候，和交接方环境和依赖关系不同很容易造成第一次 run 的失败，容易败坏心情。

总结一下将依赖关系和项目一同打包发送给对方的几个方法。

<!-- more -->

# 使用 conda

推荐在自己机器上开发程序时，使用虚拟环境，避免本机的 packages 越来越多。

项目开发完成 > 导出环境 > 交接 > 删除环境

```bash
# 本机上新建环境，防止多余 site-package 混入项目
$ conda create --name <envname> [python=3.7 or 3.5]
$ conda activate <envname>
# 本机上项目运行成功后，导出 conda package
$ conda list --export > requirements.txt
# 退出环境
$ conda deactivate
# 删除环境
$ conda env remove <envname>
```

其中 requirements.txt 或者 yml 文件的样式如下

```yml
name: AI
channels:
  - pytorch
  - conda-forge
  - defaults
dependencies:
  - python=3.6
  - ujson
  - numpy
  - pip
  - spacy=2.0.16
  - tensorboard
  - tensorflow
  - tensorboardX
  - tqdm
  - urllib3
  - pytorch=1.0.0
  - pip:
    - torch==1.0.0
```

项目发送给对方后

```bash
# 对方通过 requirements.txt 创建项目环境
$ conda create --name <envname> --file requirements.txt
$ conda activate <envname>
```

优点：简单无多余

缺点：必须装 conda

# 使用 pip

```bash
# 本机
$ pip freeze > requirements.txt
# 对方
$ pip install -r requirements.txt
```

优点：python 内置 pip，基本哪都能用，最简洁。

缺点：将本机所有包（项目不需要的）一起发送给对方，并且对方也将包全部混入自己的环境中，不是很好。

# 使用 docker

这个主要还是用于发布到生产环境中，我感觉不适用项目交接。

# 总结

综合来看，conda 不错，conda env 感觉用起来比较顺手。