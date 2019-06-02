import * as React from 'react';
import { Menu, Icon, Button } from 'antd';
import './index.less';
import {
  IStarredRepo,
  ILanguages,
  ITag,
  ITagCountMap,
  IStarTaggedStatus,
  ALL_STARS,
  IFilterReposAction,
} from '../../typings';

const { SubMenu } = Menu;
interface ISidebar {
  tags: ITag[];
  languages: ILanguages[];
  tagCountMap: ITagCountMap;
  starTaggedStatus: IStarTaggedStatus;
  onSelect: (action: IFilterReposAction) => void;
}

const Sidebar = ({
  tags,
  languages,
  tagCountMap,
  starTaggedStatus,
  onSelect,
}: ISidebar) => {
  const handleLanguageSelect = ({ item, key }) => {
    const [type, payload] = key.split('-');
    onSelect({ type, payload });
  };
  return (
    <div className="sidebar-wrap">
      <Menu
        defaultSelectedKeys={[ALL_STARS]}
        defaultOpenKeys={['tags', 'languages']}
        mode="inline"
        onSelect={handleLanguageSelect}
      >
        <Menu.ItemGroup
          key="stars"
          title={
            <div>
              <span>stars</span>
            </div>
          }
        >
          {Object.keys(starTaggedStatus).map((status) => {
            return (
              <Menu.Item key={`star-${status}`}>
                {status}
                {starTaggedStatus[status]}
              </Menu.Item>
            );
          })}
        </Menu.ItemGroup>
        <SubMenu
          key="tags"
          title={
            <span>
              <span>tags</span>
            </span>
          }
        >
          {tags &&
            tags.map(({ id, name }) => {
              return (
                <Menu.Item key={`tag-${id}`}>
                  {name}
                  {tagCountMap[id]}
                </Menu.Item>
              );
            })}
        </SubMenu>
        <SubMenu
          key="languages"
          title={
            <span>
              <span>languages</span>
            </span>
          }
        >
          {languages &&
            languages.map((lang) => {
              return (
                <Menu.Item key={`language-${lang.name}`}>
                  {lang.name} {lang.count}
                </Menu.Item>
              );
            })}
        </SubMenu>
      </Menu>
    </div>
  );
};

export default Sidebar;
