import * as React from 'react';
import { IStarredRepo, ITag, tagId, ITagsAction } from '../../typings';
import { useState, useEffect } from 'react';
import { getReadmeHTML } from '../../service';
import 'github-markdown-css';
import './index.less';
import { Select } from 'antd';
import { genUniqueKey } from '../../utils';

const { Option } = Select;

interface IRepoInfo {
  repo: IStarredRepo;
  tags: ITag[];
  selectedTagIds: tagId[];
  onTagsChange: (action: ITagsAction) => void;
}

const RepoInfo = ({
  repo,
  tags,
  onTagsChange,
  selectedTagIds = [],
}: IRepoInfo) => {
  if (!repo) {
    // todo use image
    return <div>none</div>;
  }
  const [content, setContent] = useState('');

  useEffect(() => {
    getReadmeHTML({ full_name }).then((rsp) => {
      const htmlString = rsp.data;
      const content = fixRelativeUrl(htmlString, repo);
      setContent(content);
    });
  }, [repo]);

  const {
    starred_at,
    repo: { id, full_name, created_at, updated_at, language },
  } = repo;

  const fixRelativeUrl = (htmlString: string, { repo }: IStarredRepo) => {
    const _site = `https://raw.githubusercontent.com/${repo.full_name}/${
      repo.default_branch
    }`;
    // current abolute url origin
    const _origin = location.origin;
    const _container = document.createElement('div');
    _container.innerHTML = htmlString;
    // todo fix other tag (e.g. <a>)
    _container.querySelectorAll('img').forEach((imgEl) => {
      // replace with correct url
      imgEl.src = imgEl.src.replace(_origin, _site);
    });
    return _container.innerHTML;
  };

  const handleSelectTag = (value: string) => {
    const ids = tags.map((tag) => tag.id);
    let action: ITagsAction;
    const idx = ids.indexOf(value);

    if (idx !== -1) {
      action = {
        type: 'add',
        payload: {
          repoId: id,
          tag: tags[idx],
        },
        selectedTagIds,
      };
    } else {
      const newTag: ITag = { id: genUniqueKey(), name: value };
      action = {
        type: 'create',
        payload: {
          repoId: id,
          tag: newTag,
        },
        selectedTagIds,
      };
    }
    onTagsChange(action);
  };
  const handleDeselectTag = (value: string) => {
    const action: ITagsAction = {
      type: 'delete',
      payload: {
        repoId: id,
        // todo search correct tag
        tag: { id: value, name: '' },
      },
      selectedTagIds,
    };
    onTagsChange(action);
  };
  return (
    // todo fix scroll position
    <div className="info_wrap">
      <div>
        <h2>{full_name}</h2>
        <div>
          {created_at} {updated_at} {starred_at}
        </div>
        <div>
          <Select
            value={selectedTagIds}
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Add a tag"
            onSelect={handleSelectTag}
            onDeselect={handleDeselectTag}
          >
            {tags &&
              tags.map(({ id, name }) => {
                return <Option key={id}>{name}</Option>;
              })}
          </Select>
        </div>
        {/* todo add Tag */}
      </div>
      <article
        className="markdown-body"
        // todo fix relavtive path (e.g. /dist/logo.icon)
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default RepoInfo;
