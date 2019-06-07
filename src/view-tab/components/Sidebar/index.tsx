import * as React from 'react';
import { Menu, Icon, Button, Select, Input } from 'antd';
import './index.less';
import { ILanguages, ITag } from '../../../typings';
import { genUniqueKey, localStoragePromise } from '../../../utils';

const { SubMenu } = Menu;
const Search = Input.Search;

export const ALL_STARS = 'all stars';
export const UNTAGGED_STARS = 'untagged stars';
export const UNKOWN = 'Unkown';
export type statusKey = typeof ALL_STARS | typeof UNTAGGED_STARS;

export type IStarTaggedStatus = { [key in statusKey]: number };

export interface IFilterReposAction {
  type: 'star' | 'tag' | 'language';
  payload: string;
}

export interface ITagCountMap {
  [tagId: string]: number;
}

interface ISidebar {
  tags: ITag[];
  languages: ILanguages[];
  tagCountMap: ITagCountMap;
  starTaggedStatus: IStarTaggedStatus;
  onAddTag: (tags: ITag[]) => void;
  onSelect: (action: IFilterReposAction) => void;
}

const Sidebar = ({
  tags,
  languages,
  tagCountMap,
  starTaggedStatus,
  onAddTag,
  onSelect,
}: ISidebar) => {
  const handleLanguageSelect = ({ item, key }) => {
    const [type, payload] = key.split('-');
    onSelect({ type, payload });
  };

  const handleAddTag = async (name: string) => {
    const newTags: ITag[] = [...tags, { id: genUniqueKey(), name }];
    await localStoragePromise.set({ tags: newTags });
    onAddTag(newTags);
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
          <div>
            <Search
              placeholder="Add a tag"
              onSearch={handleAddTag}
              enterButton={<Icon type="plus" />}
              onPressEnter={(e: React.KeyboardEvent<HTMLInputElement>) => {
                handleAddTag((e.target as HTMLInputElement).value);
              }}
            />
          </div>
          {tags &&
            tags.map(({ id, name }) => {
              return (
                <Menu.Item key={`tag-${id}`}>
                  {name}
                  {tagCountMap[id] || 0}
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
