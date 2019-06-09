import * as React from 'react';
import { Menu, Icon, Button, Select, Input, Tag } from 'antd';
import './index.less';
import { ILanguages, ITag } from '../../../typings';
import { genUniqueKey, localStoragePromise } from '../../../utils';
import { useState, useRef } from 'react';

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
  loading: boolean;
  languages: ILanguages[];
  tagCountMap: ITagCountMap;
  starTaggedStatus: IStarTaggedStatus;
  onAddTag: (tags: ITag[]) => void;
  onRefresh: () => void;
  onSelect: (action: IFilterReposAction) => void;
}

const Sidebar = ({
  tags,
  loading,
  languages,
  tagCountMap,
  starTaggedStatus,
  onAddTag,
  onRefresh,
  onSelect,
}: ISidebar) => {
  const [showAddTag, setShowAddTag] = useState<boolean>(false);
  const addTagInputRef = useRef(null);

  const handleLanguageSelect = ({ item, key }) => {
    const [type, payload] = key.split(':');
    onSelect({ type, payload });
  };

  const handleAddTag = async (name: string) => {
    const newTags: ITag[] = [...tags, { id: genUniqueKey(), name }];
    await localStoragePromise.set({ tags: newTags });
    onAddTag(newTags);
    addTagInputRef.current.input.input.value = '';
    addTagInputRef.current.focus();
  };

  return (
    <div className="sidebar-wrap">
      <Menu
        defaultSelectedKeys={[`star:${ALL_STARS}`]}
        defaultOpenKeys={['tags', 'languages']}
        mode="inline"
        onSelect={handleLanguageSelect}
      >
        <Menu.ItemGroup
          key="stars"
          title={
            <div>
              <Icon type="star" />
              &nbsp;&nbsp;&nbsp;
              <span className="sidebar-menu-label">stars</span>
              <span className="sidebar-sync-btn" onClick={onRefresh}>
                <Icon type="sync" spin={loading} />
              </span>
            </div>
          }
        >
          {Object.keys(starTaggedStatus).map((status) => {
            return (
              <Menu.Item key={`star:${status}`}>
                {status}
                <span className="sidebar-count-tag">
                  <Tag>{starTaggedStatus[status]}</Tag>
                </span>
              </Menu.Item>
            );
          })}
        </Menu.ItemGroup>
        <SubMenu
          key="tags"
          title={
            <div>
              <Icon type="tags" />
              <span className="sidebar-menu-label">tags</span>
            </div>
          }
        >
          <div className="sidebar-input-tag-wrap">
            {showAddTag ? (
              <Search
                autoFocus
                ref={addTagInputRef}
                placeholder="Enter a tag name"
                onSearch={handleAddTag}
                enterButton={'Add'}
                onPressEnter={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  handleAddTag((e.target as HTMLInputElement).value);
                }}
              />
            ) : (
              <span
                className="sidebar-input-tag-btn"
                onClick={() => {
                  setShowAddTag(true);
                }}
              >
                <Icon type="plus-circle" />
                &nbsp;&nbsp; Add a Tag
              </span>
            )}
          </div>
          {tags &&
            tags.map(({ id, name }) => {
              // todo edit tag (rename / delete)
              return (
                <Menu.Item key={`tag:${id}`}>
                  {name}
                  <span className="sidebar-count-tag">
                    <Tag>{tagCountMap[id] || 0}</Tag>
                  </span>
                </Menu.Item>
              );
            })}
        </SubMenu>
        <SubMenu
          key="languages"
          title={
            <div>
              <Icon type="global" />
              <span className="sidebar-menu-label">languages</span>
            </div>
          }
        >
          {languages &&
            languages.map((lang) => {
              return (
                <Menu.Item key={`language:${lang.name}`}>
                  {lang.name}

                  <span className="sidebar-count-tag">
                    <Tag>{lang.count}</Tag>
                  </span>
                </Menu.Item>
              );
            })}
        </SubMenu>
      </Menu>
    </div>
  );
};

export default Sidebar;
