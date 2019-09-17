import React, { useState, useRef, useEffect } from 'react';
import { Select, message } from 'antd';
import {
  ITag,
  ITagsAction,
  TagId,
  RepoId,
  STORAGE_TAGS,
  STORAGE_REPO,
  IRepoWithTag,
} from '../typings';
import { genUniqueKey, localStoragePromise } from '../utils';

const { Option } = Select;

export interface ISelectTagsProps {
  repoId: RepoId;
  caseSensitivity: boolean;
  tags: ITag[];
  repoWithTags: IRepoWithTag;
  isFocus?: boolean;
  onTagsChange?: (action: ITagsAction) => void;
}

const SelectTags = ({
  repoId,
  tags: initTags,
  repoWithTags,
  caseSensitivity,
  onTagsChange,
  isFocus = false,
}: ISelectTagsProps) => {
  const initSelectedTagIds = repoWithTags[repoId] || [];
  const [selectedTagIds, setSelectedTagIds] = useState<TagId[]>(
    initSelectedTagIds,
  );
  const [tags, setTags] = useState<ITag[]>(initTags);
  const selectRef = useRef(null);

  const handleSelectTag = (value: string) => {
    const ids = tags.map((tag) => tag.id);
    const idx = ids.indexOf(value);
    if (idx !== -1) {
      // add tag
      const tag = tags[idx];
      const newSelectedTagIds = [...selectedTagIds, tag.id];
      const newRepoWithTags = {
        ...repoWithTags,
        [repoId.toString()]: newSelectedTagIds,
      };

      localStoragePromise
        .set({
          [STORAGE_REPO]: newRepoWithTags,
        })
        .then(() => {
          if (onTagsChange) {
            const action: ITagsAction = {
              type: 'add',
              payload: {
                repoId,
                tag,
              },
            };
            onTagsChange(action);
          }
          setSelectedTagIds(newSelectedTagIds);
        })
        .catch((errors) => {
          // todo
          // tslint:disable-next-line:no-console
          console.error('errors: ', errors);
        });
    } else {
      const findItem = tags.find((item) => {
        return caseSensitivity
          ? item.name === value
          : item.name.toLowerCase() === value.toLowerCase();
      });

      // selected existing tag
      if (findItem) {
        handleSelectTag(findItem.id);
        return;
      }

      // create tag
      const tagId = genUniqueKey();
      const newTag: ITag = { id: tagId, name: value };

      const newTags = [...tags, newTag];
      const newSelectedTagIds = [...selectedTagIds, tagId];
      const newRepoWithTags = {
        ...repoWithTags,
        [repoId.toString()]: newSelectedTagIds,
      };

      localStoragePromise
        .set({ [STORAGE_REPO]: newRepoWithTags, [STORAGE_TAGS]: newTags })
        .then(() => {
          if (onTagsChange) {
            const action: ITagsAction = {
              type: 'create',
              payload: {
                repoId,
                tag: newTag,
              },
            };
            onTagsChange(action);
          }
          setSelectedTagIds(newSelectedTagIds);
          setTags(newTags);
        })
        .catch((errors) => {
          // todo
          // tslint:disable-next-line:no-console
          console.error('errors: ', errors);
        });
    }
  };

  const handleDeselectTag = (value: string) => {
    const newSelectedTagIds = selectedTagIds.filter((tagId) => tagId !== value);
    const newRepoWithTags = {
      ...repoWithTags,
      [repoId.toString()]: newSelectedTagIds,
    };

    localStoragePromise
      .set({
        [STORAGE_REPO]: newRepoWithTags,
      })
      .then(() => {
        if (onTagsChange) {
          const action: ITagsAction = {
            type: 'delete',
            payload: {
              repoId,
              // todo search correct tag
              tag: { id: value, name: '' },
            },
          };
          onTagsChange(action);
        }
        setSelectedTagIds(newSelectedTagIds);
      })
      .catch((errors) => {
        // todo
        // tslint:disable-next-line:no-console
        console.error('errors: ', errors);
      });
  };

  useEffect(() => {
    if (isFocus) {
      selectRef.current.focus();
    }
  }, []);

  return (
    <Select
      // @ts-ignore
      value={selectedTagIds}
      mode="tags"
      filterOption={(inputValue, { props: { children } }) => {
        return (children as string).includes(inputValue);
      }}
      style={{ width: '100%' }}
      placeholder="Add tags..."
      onSelect={handleSelectTag}
      onDeselect={handleDeselectTag}
      ref={selectRef}
      maxTagCount={1}
      maxTagTextLength={6}
      maxTagPlaceholder={`${selectedTagIds.length - 1} tags`}
    >
      {tags &&
        tags.map(({ id, name }) => {
          return <Option key={id}>{name}</Option>;
        })}
    </Select>
  );
};

export default SelectTags;
