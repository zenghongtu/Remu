import * as React from 'react';
import { ITag, TagId, ITagsAction, Token } from '../../../typings';
import { useState, useEffect } from 'react';
import { getReadmeHTML, IStarredRepo } from '../../service';
import 'github-markdown-css';
import './index.less';
import { Select, Empty, Icon, Dropdown, Button, Popover } from 'antd';
import { genUniqueKey } from '../../../utils';

const { Option } = Select;

interface IRepoInfo {
  token: Token;
  repo: IStarredRepo;
  tags: ITag[];
  selectedTagIds: TagId[];
  onTagsChange: (action: ITagsAction) => void;
}

const RepoInfo = ({
  token,
  repo,
  tags,
  onTagsChange,
  selectedTagIds = [],
}: IRepoInfo) => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    getReadmeHTML({ full_name, token }).then((rsp) => {
      const htmlString = rsp.data;
      const content = fixRelativeUrl(htmlString, repo);
      setContent(content);
    });
  }, [repo]);

  const {
    starred_at,
    repo: { id, full_name, created_at, updated_at, language, html_url },
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
    <div className="info-wrap">
      <div className="info-meta">
        <h2 className="info-top">
          <span>
            <Icon type="star" />
          </span>
          &nbsp; &nbsp;
          <span className="info-repo-title" title={full_name}>
            <a
              className="info-repo-github-link"
              href={html_url}
              target="_blank"
            >
              {full_name}
            </a>
          </span>
          <Button size="small" ghost>
            More Info
          </Button>
        </h2>

        <div className="info-bottom">
          <span>
            <Select
              // @ts-ignore
              value={selectedTagIds}
              mode="tags"
              filterOption={(inputValue, { props: { children } }) => {
                return (children as string).includes(inputValue);
              }}
              style={{ width: '100%' }}
              placeholder="Add tags"
              onSelect={handleSelectTag}
              onDeselect={handleDeselectTag}
              loading={false}
              maxTagCount={4}
              maxTagTextLength={4}
              maxTagPlaceholder={`and ${selectedTagIds.length - 4} tags`}
            >
              {tags &&
                tags.map(({ id, name }) => {
                  return <Option key={id}>{name}</Option>;
                })}
            </Select>
          </span>
          &nbsp;
          <span>
            <Popover
              // todo
              content={
                <div>
                  <span>
                    <Icon type="download" />
                  </span>
                  <span>
                    <Icon type="copy" />
                  </span>
                </div>
              }
              placement="bottomLeft"
              title="Clone with HTTPS"
              trigger="click"
            >
              <Button>
                Clone or download <Icon type="down" />
              </Button>
            </Popover>
          </span>
        </div>
      </div>
      <div className="info-content">
        {content && (
          <article
            className="markdown"
            // todo fix relavtive path (e.g. /dist/logo.icon)
            // todo fix a tag open
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </div>
  );
};

export default RepoInfo;
