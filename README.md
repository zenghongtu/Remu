<p align="center">
<a href="https://chrome.google.com/webstore/detail/remu/bajifjohhghngljcfhkbpcggafpiajdo"><img src="./docs/logo.png" width="100"/></a>
<div align="center">
<span style="font-size:16px;">Remu</span> - <span style="font-size:14px;font-weight:300;">高效管理你的 GitHub Stars 从未如此轻松。</span>
</div>
</p>

---

<div align="center">
 <div><a style="font-size:12px" href="./README.en.md">[English README]</a></div>
  <div>
    <a href="https://github.com/zenghongtu/Remu/releases"><img src="https://camo.githubusercontent.com/d0ccf63e875fba0eb2d61287382ade6ae59ed1ad/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f72656c656173652f7a656e67686f6e6774752f4d6f622e7376673f7374796c653d666c61742d737175617265" alt="Current Release" data-canonical-src="https://img.shields.io/github/release/zenghongtu/Mob.svg?style=flat-square" style="max-width:100%;"></a>
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/3bb863d4a8a6ddd0c2c4b4c67dab6bb58dee9b07/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6c6963656e73652f7a656e67686f6e6774752f4d6f622e7376673f7374796c653d666c61742d737175617265"><img src="https://camo.githubusercontent.com/3bb863d4a8a6ddd0c2c4b4c67dab6bb58dee9b07/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6c6963656e73652f7a656e67686f6e6774752f4d6f622e7376673f7374796c653d666c61742d737175617265" alt="License" data-canonical-src="https://img.shields.io/github/license/zenghongtu/Mob.svg?style=flat-square" style="max-width:100%;"></a>
  </div>
   Made with:
  <img src="https://cdn4.iconfinder.com/data/icons/logos-3/600/React.js_logo-512.png" height=20 />
  &
  <img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" height=20 />
</div>

---

## What is Remu?

Remu（レム）是雷姆的非日语假名拼音 😋。

here, 她是一个 Chrome 浏览器插件，通过标签分类来对 GitHub Stars 进行高效管理，借助 Gists 强大能力实现<sup>1</sup>跨平台的数据同步。👏🏻

<sup>1 - Chrome 提供的同步能力（storage.sync）只有 100kb 大小的存储容量，且只能存储 512 项，每项 8kb。如果 repo 数量和标签过多就会有部分数据无法同步，所以我使用 Gists 来进行同步（目前没有容量的限制），顺带还可以查看历史记录。</sup>

<img src="./docs/screenshot.png" width="890" />

## Install

<a href="https://chrome.google.com/webstore/detail/remu/bajifjohhghngljcfhkbpcggafpiajdo"><img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_128x128.png" width="48" /></a>

[Chrome Web Store](https://chrome.google.com/webstore/detail/remu/bajifjohhghngljcfhkbpcggafpiajdo)

## Feature

- 显示 star 仓库 / watching 仓库 (默认关闭)
- 添加 Notes
- 仓库设置/编辑/删除标签
- 取消 Star / Download Zip / Clone with HTTPS
- Google 账号同步 Token/GistId, Gist **自动同步**标签数据（默认 6 秒延迟）
- 等等...

### Repo

<img src="./docs/remu-repo.gif" width="890" />

### Tab

<img src="./docs/remu-tab.gif" width="890" />

## Next Feature

- [ ] 多语言
- [ ] 主题
- [ ] Star 历史
- [ ] TOC
- [ ] 搜索提示
- [ ] 标签定制颜色
- [ ] 支持国内浏览器？

## Screenshot

### Settings

<img src="./docs/settings.png" width="890" />

### Token Scopes

<img src="./docs/token-scope.png" width="890" />

## Development

```shell
yarn run start
```

## Community

<img src="./docs/weixin-group.png" width="400" />

## License

MIT © [zenghongtu](https://github.com/zenghongtu)
