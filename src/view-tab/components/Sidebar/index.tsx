import * as React from 'react';
import { Menu, Icon, Button, Select, Input, Tag, Popover } from 'antd';
import './index.less';
import {
  ILanguages,
  ITag,
  TagId,
  IMessageAction,
  IResponseMsg,
} from '../../../typings';
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
  onEditTag: (tags: ITag[]) => void;
  onDelTag: (tags: TagId) => void;
  onRefresh: () => void;
  onSelect: (action: IFilterReposAction) => void;
}

const sendMessage = (action: IMessageAction) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(action, function(response: IResponseMsg) {
      if (response.status === 'error') {
        reject(response);
      } else if (response.status === 'success') {
        resolve(response);
      }
    });
  });
};

const Sidebar = ({
  tags,
  languages,
  tagCountMap,
  starTaggedStatus,
  onAddTag,
  onEditTag,
  onDelTag,
  onRefresh,
  onSelect,
}: ISidebar) => {
  const [showAddTag, setShowAddTag] = useState<boolean>(false);
  const [editTagId, setEditTagId] = useState<TagId>('');
  const [editTagVal, setEditTagVal] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
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

  const handleDelTag = (id: TagId) => () => {
    onDelTag(id);
  };

  const handleEditTag = (tagId: TagId, name: string) => () => {
    setEditTagId(tagId);
    setEditTagVal(name);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setEditTagVal(value);
    }
  };

  const handleEditInputPressEnter = async () => {
    const newTags: ITag[] = tags.map(
      (tag) => (tag.id === editTagId && (tag.name = editTagVal), tag),
    );

    await localStoragePromise.set({ tags: newTags });
    onEditTag(newTags);
    setEditTagVal('');
    setEditTagId('');
  };

  const handleUpdateGist = () => {
    setLoading(true);
    sendMessage({ type: 'updateGist' }).then(() => {
      setLoading(false);
    });
  };

  const handleUpdateLocal = async () => {
    setLoading(true);
    sendMessage({ type: 'updateLocal' }).then(() => {
      setLoading(false);
    });
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
                <Popover
                  content={
                    <div>
                      <Button
                        shape="circle"
                        icon="cloud-upload"
                        onClick={handleUpdateGist}
                        title="update Gist"
                      ></Button>
                      &nbsp; &nbsp;
                      <Button
                        shape="circle"
                        icon="cloud-download"
                        onClick={handleUpdateLocal}
                        title="upload Local"
                      ></Button>
                    </div>
                  }
                >
                  <Icon type="sync" spin={loading} />
                </Popover>
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
              return (
                <Menu.Item key={`tag:${id}`}>
                  {id === editTagId ? (
                    <Input
                      value={editTagVal}
                      onChange={handleEditInputChange}
                      onPressEnter={handleEditInputPressEnter}
                    />
                  ) : (
                    name
                  )}
                  <div className="sidebar-count-tag">
                    <Popover
                      content={
                        <div>
                          <Button
                            onClick={handleEditTag(id, name)}
                            shape="circle"
                            icon="edit"
                          ></Button>
                          &nbsp; &nbsp;
                          <Button
                            type="danger"
                            onClick={handleDelTag(id)}
                            shape="circle"
                            icon="delete"
                          ></Button>
                        </div>
                      }
                      trigger="hover"
                    >
                      <Tag>{tagCountMap[id] || 0}</Tag>
                    </Popover>
                  </div>
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
