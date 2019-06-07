import * as React from 'react';
import logo from '../../assets/logo.png';
import './index.less';
import { useState, useEffect } from 'react';
import { getUserProfile, IUserProfile } from '../../service';
import { Token } from '../../../typings';
import { Menu, Dropdown, Icon } from 'antd';
import pkg from '../../../../package.json';

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
  useEffect(() => {
    getUserProfile({ token }).then(({ data }) => {
      setUserProfile(data);
    });
  }, []);

  return (
    <div className="header-inner">
      <div className="logo">
        <a href={pkg.homepage} target="_blank">
          <img width={50} src={logo} alt="Remu" />
        </a>
      </div>
      {userProfile && (
        <div className="profile">
          <Dropdown
            overlay={
              <Menu>
                {menuList.map((menu) => {
                  return (
                    <Menu.Item key={menu.path}>
                      <a
                        href={`https://github.com/${userProfile.login}/${
                          menu.path
                        }`}
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
            trigger={['click']}
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
      )}
    </div>
  );
};

export default Header;
