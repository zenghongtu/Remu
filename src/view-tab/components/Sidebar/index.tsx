import * as React from 'react';
import {
  Menu,
  Icon,
  Button,
  Select,
  Input,
  Tag,
  Popover,
  Dropdown,
} from 'antd';
import './index.less';
import {
  ILanguages,
  ITag,
  TagId,
  IMessageAction,
  IResponseMsg,
  tagSort,
  STORAGE_TOKEN,
  STORAGE_TAG_SORT,
  STORAGE_SETTINGS,
} from '../../../typings';
import {
  genUniqueKey,
  localStoragePromise,
  syncStoragePromise,
} from '../../../utils';
import { useState, useRef, useEffect } from 'react';

const { SubMenu } = Menu;
const Search = Input.Search;

export const ALL_STARS = 'all stars';
export const ALL_WATCHS = 'all watchs';
export const UNTAGGED_STARS = 'untagged stars';
export const UNTAGGED_WATCHS = 'untagged watchs';
export const UNKOWN = 'Unkown';
export type statusKey = typeof ALL_STARS | typeof UNTAGGED_STARS;
export type statusWatchKey = typeof ALL_WATCHS | typeof UNTAGGED_WATCHS;

export type IStarTaggedStatus = { [key in statusKey]: number };
export type IWatchTaggedStatus = { [key in statusWatchKey]: number };

export interface IFilterReposAction {
  type: 'star' | 'tag' | 'language' | 'watch';
  payload: string;
}

export interface ITagCountMap {
  [tagId: string]: number;
}

interface ISidebar {
  tags: ITag[];
  loading: boolean;
  tagSortBy: tagSort;
  languages: ILanguages[];
  tagCountMap: ITagCountMap;
  starTaggedStatus: IStarTaggedStatus;
  watchTaggedStatus: IWatchTaggedStatus;
  showWatch: boolean;
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

const sortMenuItems = [
  { key: 'add_time', value: 'Add time (Default)' },
  { key: 'a_z', value: 'Alphabetical (A-Z)' },
  { key: 'z_a', value: 'Alphabetical (Z-A)' },
  { key: 'most_stars', value: 'Most Stars' },
  { key: 'fewest_stars', value: 'Fewest Stars' },
];

const Sidebar = ({
  tags,
  languages,
  tagCountMap,
  tagSortBy: currTagSortBy,
  starTaggedStatus,
  watchTaggedStatus,
  onAddTag,
  onEditTag,
  onDelTag,
  onRefresh,
  onSelect,
  showWatch,
}: ISidebar) => {
  const [showAddTag, setShowAddTag] = useState<boolean>(false);
  const [editTagId, setEditTagId] = useState<TagId>('');
  const [editTagVal, setEditTagVal] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [tagSortBy, setTagSortBy] = useState<tagSort>(currTagSortBy);
  const [sortedTags, setSortedTags] = useState<ITag[]>(tags);
  const addTagInputRef = useRef(null);

  useEffect(() => {
    let _sortedTags: ITag[];
    const _tags = [...tags];
    // TODO fix case
    switch (tagSortBy) {
      case 'add_time':
        _sortedTags = _tags;
        break;
      case 'a_z':
        _sortedTags = _tags.sort((a, b) => {
          return a.name < b.name ? -1 : 1;
        });
        break;
      case 'z_a':
        _sortedTags = _tags.sort((a, b) => {
          return a.name < b.name ? 1 : -1;
        });
        break;
      case 'most_stars':
        _sortedTags = _tags.sort((a, b) => {
          return tagCountMap[a.id] < tagCountMap[b.id] ? 1 : -1;
        });
        break;
      case 'fewest_stars':
        _sortedTags = _tags.sort((a, b) => {
          return tagCountMap[a.id] < tagCountMap[b.id] ? -1 : 1;
        });
        break;
    }
    setSortedTags(_sortedTags);
  }, [tags, tagSortBy, tagCountMap]);

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
    setEditTagVal(value);
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

  const handleUpdateGist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setLoading(true);
    sendMessage({ type: 'updateGist' }).then(() => {
      setLoading(false);
    });
  };

  const handleUpdateLocal = (e: React.MouseEvent<Button>) => {
    e.stopPropagation();
    setLoading(true);
    sendMessage({ type: 'updateLocal' }).then(() => {
      setLoading(false);
    });
  };

  const handleSortItemClick = (key) => () => {
    syncStoragePromise.get([STORAGE_SETTINGS]).then((result) => {
      const settings = result[STORAGE_SETTINGS];
      syncStoragePromise
        .set({ [STORAGE_SETTINGS]: { ...settings, [STORAGE_TAG_SORT]: key } })
        .then(() => {
          setTagSortBy(key);
        });
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
                        // @ts-ignore
                        onClick={handleUpdateLocal}
                        title="upload Local"
                      ></Button>
                    </div>
                  }
                >
                  <Icon type="sync" title="refresh data" spin={loading} />
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
        {showWatch && (
          <Menu.ItemGroup
            key="watchs"
            title={
              <div>
                <Icon type="eye" />
                &nbsp;&nbsp;&nbsp;
                <span className="sidebar-menu-label">watchs</span>
              </div>
            }
          >
            {Object.keys(watchTaggedStatus).map((status) => {
              return (
                <Menu.Item key={`watch:${status}`}>
                  {status}
                  <span className="sidebar-count-tag">
                    <Tag>{watchTaggedStatus[status]}</Tag>
                  </span>
                </Menu.Item>
              );
            })}
          </Menu.ItemGroup>
        )}
        <SubMenu
          key="tags"
          title={
            <div>
              <Icon type="tags" />
              <span className="sidebar-menu-label">tags</span>
              <span
                className="sidebar-menu-sort"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Dropdown
                  placement="bottomCenter"
                  overlay={
                    <Menu>
                      {sortMenuItems.map(({ key, value }) => {
                        return (
                          <Menu.Item key={key}>
                            <span
                              onClick={handleSortItemClick(key)}
                              className={key === tagSortBy ? `active-sort` : ''}
                            >
                              {value}
                            </span>
                          </Menu.Item>
                        );
                      })}
                    </Menu>
                  }
                >
                  <b>SORT</b>
                </Dropdown>
              </span>
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
          {sortedTags &&
            sortedTags.map(({ id, name }) => {
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
