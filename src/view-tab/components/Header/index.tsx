import * as React from 'react';
import logo from '../../assets/logo.png';
import './index.less';
import { useState, useEffect, useRef } from 'react';
import { getUserProfile, IUserProfile } from '../../service';
import { Token } from '../../../typings';
import {
  Menu,
  Dropdown,
  Icon,
  Input,
  Popover,
  Button,
  Tooltip,
  Modal,
} from 'antd';
import pkg from '../../../../package.json';
import { openOptionsPage } from '../../../utils';

const menuList = [
  { path: '', label: 'Overview' },
  { path: 'followers', label: 'Followers' },
  { path: 'following', label: 'Following' },
  { path: '?tab=repositories', label: 'Repositories' },
  { path: '?tab=projects', label: 'Projects' },
];

interface IHeader {
  token: Token;
}

const Header = ({ token }: IHeader) => {
  const [userProfile, setUserProfile] = useState<IUserProfile>(null);
  const [searchFocus, setSearchFocus] = useState<boolean>(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (token) {
      getUserProfile({ token }).then(({ data }) => {
        setUserProfile(data);
      });
    }
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [token]);

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.keyCode === 191) {
      e.preventDefault();
      e.stopPropagation();
      searchInputRef.current.focus();
    }
  };

  const handleSearchPressEnter = (e: any) => {
    let url: string;
    if (e.target.title === 'github') {
      url = `https://github.com/search?q=${e.target.value}&utm_source=remu_browser_extension`;
    } else {
      url = `https://www.npmjs.com/search?q=${e.target.value}&utm_source=remu_browser_extension`;
    }
    window.open(url);
  };

  return (
    <div className="header-inner">
      <div className="header-left">
        <Popover
          placement="bottomRight"
          content={
            <div>
              <Tooltip placement="topLeft" title={`Option`}>
                <Button
                  shape="circle"
                  icon="setting"
                  onClick={() => {
                    openOptionsPage();
                  }}
                />
              </Tooltip>
              &nbsp; &nbsp;
              <Tooltip
                placement="topLeft"
                title={`Like this? Buy me a coffee!😄`}
              >
                <Button
                  shape="circle"
                  icon="like"
                  onClick={() => {
                    Modal.info({
                      icon: null,
                      width: 800,
                      content: (
                        <div>
                          <div className="pay-img-wrap">
                            <img
                              className="pay-img"
                              src="/pay-zfb.jpg"
                              alt="pay-zfb"
                            />
                            <img
                              className="pay-img"
                              src="/pay-wx.jpg"
                              alt="pay-wx"
                            />
                            <a
                              target="_blank"
                              href="https://www.paypal.me/zenghongtu"
                            >
                              <img
                                className="pay-img"
                                src="/pay-paypal.jpg"
                                alt="pay-paypal"
                              />
                            </a>
                          </div>
                          <br />
                          <br />
                          <p
                            style={{ textAlign: 'center', fontWeight: 'bold' }}
                          >
                            Thank you for your support😘. I will try my best to
                            improve it!😋
                          </p>
                        </div>
                      ),
                    });
                  }}
                />
              </Tooltip>
              &nbsp; &nbsp;
              <Tooltip
                placement="topLeft"
                title={`Have problems? Let's open a issue~`}
              >
                <Button
                  shape="circle"
                  icon="frown"
                  onClick={() => {
                    window.open(pkg.bugs.url);
                  }}
                />
              </Tooltip>
            </div>
          }
        >
          <a href={pkg.homepage} target="_blank">
            <img width={50} src={logo} alt="Remu" />
          </a>
        </Popover>
        <div className="header-search-github-wrap">
          <Input
            ref={searchInputRef}
            size="large"
            placeholder="Search GitHub"
            title="github"
            prefix={
              <Icon
                type="github"
                style={{ fontSize: '16px', color: 'rgba(0,0,0,.25)' }}
              />
            }
            onPressEnter={handleSearchPressEnter}
          />
          {!searchFocus && <div className="search-hotkey-slash">/</div>}
        </div>
        <div className="header-search-npm-wrap">
          <Input
            size="large"
            placeholder="Search NPM"
            title="npm"
            prefix={
              <img
                style={{ width: '16px' }}
                src={
                  // tslint:disable-next-line:max-line-length
                  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTYwMDA5ODY5MzQ3IiBjbGFzcz0iaWNvbiIgc3R5bGU9IiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjM4MjQiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTAgMHYxMDI0aDEwMjRWMEgweiBtODMyIDgzMmgtMTI4VjMyMEg1MTJ2NTEySDE5MlYxOTJoNjQwdjY0MHoiIHAtaWQ9IjM4MjUiIGZpbGw9IiNiZmJmYmYiPjwvcGF0aD48L3N2Zz4='
                }
              />
            }
            onPressEnter={handleSearchPressEnter}
          />
        </div>
      </div>

      {userProfile ? (
        <div className="profile">
          <Dropdown
            overlay={
              <Menu>
                {menuList.map((menu) => {
                  return (
                    <Menu.Item key={menu.path}>
                      <a
                        href={`https://github.com/${userProfile.login}/${menu.path}`}
                        target="_blank"
                      >
                        {menu.label}
                      </a>
                    </Menu.Item>
                  );
                })}
                <Menu.Item key={'gist'}>
                  <a
                    href={`https://gist.github.com/${userProfile.login}/`}
                    target="_blank"
                  >
                    Gist
                  </a>
                </Menu.Item>
              </Menu>
            }
            trigger={['hover']}
          >
            <span>
              <img
                className="avatar-img"
                src={userProfile.avatar_url}
                alt="avatar"
              />
              <span className="user-login">{userProfile.login}</span>{' '}
              <Icon type="down" />
            </span>
          </Dropdown>
        </div>
      ) : (
        <div style={{ width: '150px' }}>
          <Icon type="loading" />
        </div>
      )}
    </div>
  );
};

export default Header;
