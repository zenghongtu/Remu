[中文 README](./README.md)

<p align="center">
<a href="https://chrome.google.com/webstore/detail/remu/bajifjohhghngljcfhkbpcggafpiajdo"><img src="./docs/logo.png" width="100"/></a>
<div align="center">
<span style="font-size:16px;">Remu</span> - <span style="font-size:14px;font-weight:300;">Managing your GitHub Starred Repository efficiently has never been easier.</span>
<div><a style="font-size:12px" href="./README.md">[中文 README]</a></div>
</div>
</div>
</p>

---

<p align="center">
  Made with:
  <img src="https://cdn4.iconfinder.com/data/icons/logos-3/600/React.js_logo-512.png" height=20 />
  &
  <img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" height=20 />
    
</p>

---

## What is Remu?

Remu（レム） is rem's non-Japanese kana pinyin.

Here, she is a Chrome browser plug-in, which manages GitHub Stars efficiently through label classification, and realizes cross-platform data synchronization by virtue of Gists' powerful capability<sup>1</sup>.

<sup>1 - The sync capability (storage.sync) provided by Chrome is only 100kb in size and can only store 512 items, 8kb each. If there are too many repos and labels, some of the data will not be synchronized, so I use Gists for synchronization (there is currently no capacity limit), and by the way, I can view the history.</sup>

<img src="./docs/screenshot.png" width="890" />

## Install

<a href="https://chrome.google.com/webstore/detail/remu/bajifjohhghngljcfhkbpcggafpiajdo"><img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_128x128.png" width="48" /></a>

[Chrome Web Store](https://chrome.google.com/webstore/detail/remu/bajifjohhghngljcfhkbpcggafpiajdo)

## Feature

- Set / Edit / Delete Tags
- unStarred Repo / Download Zip / Clone with HTTPS
- Google Account Sync Token/GistId, Gist ** Auto Sync ** tag data (default 10 second delay)
- and many more...

### Repo

<img src="./docs/remu-repo.gif" width="890" />

### Tab

<img src="./docs/remu-tab.gif" width="890" />

## Next Feature

- [ ] multi-language
- [ ] theme
- [ ] star history
- [ ] toc
- [ ] search tips
- [ ] tag custom color

## Development

```shell
yarn run start
```

## Community

<img src="./docs/weixin-group.png" width="400" />

## License

MIT © [zenghongtu](https://github.com/zenghongtu)
