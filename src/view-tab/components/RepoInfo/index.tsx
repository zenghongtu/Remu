import * as React from 'react';
import { ITag, TagId, ITagsAction, Token } from '../../../typings';
import { useState, useEffect } from 'react';
import { getReadmeHTML, IStarredRepo, updateUnStarRepo } from '../../service';
import 'github-markdown-css';
import './index.less';
import copy from 'copy-to-clipboard';
import {
  Select,
  Empty,
  Icon,
  Dropdown,
  Button,
  Popover,
  message,
  Tooltip,
  Modal,
} from 'antd';
import prettyHtml from 'json-pretty-html';
import { genUniqueKey } from '../../../utils';

const { Option } = Select;

interface IRepoInfo {
  token: Token;
  repo: IStarredRepo;
  tags: ITag[];
  selectedTagIds: TagId[];
  onTagsChange: (action: ITagsAction) => void;
}

const unStarredRepos = [];

const RepoInfo = ({
  token,
  repo,
  tags,
  onTagsChange,
  selectedTagIds = [],
}: IRepoInfo) => {
  const [content, setContent] = useState(null);
  const [starred, setStarred] = useState<boolean>(true);

  const {
    starred_at,
    repo: {
      id,
      full_name,
      created_at,
      updated_at,
      language,
      html_url,
      clone_url,
      default_branch,
    },
  } = repo;

  useEffect(() => {
    getReadmeHTML({ full_name, token }).then((rsp) => {
      const htmlString = rsp.data;
      const content = fixRelativeUrl(htmlString, repo);
      setContent(content);
    });

    if (!unStarredRepos.includes(id)) {
      setStarred(true);
    } else {
      setStarred(false);
    }
  }, [repo]);

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
  const handleStarIconClick = async (e: React.MouseEvent<HTMLSpanElement>) => {
    if (starred) {
      await updateUnStarRepo({ full_name, token });
      setStarred(false);
      unStarredRepos.push(id);
      message.success(
        'Unstar success, it will update after refreshing the data.',
      );
    } else {
      message.warn('You can star only on the repository page!');
    }
  };

  const handleCopyGitUrl = () => {
    copy(clone_url);
    message.success('copy success.');
  };

  const handleDownloadZip = () => {
    const a = document.createElement('a');
    const url = `${html_url}/archive/${default_branch}.zip`;
    a.href = url;
    a.click();
  };

  const handleMoreInfoBtnClick = () => {
    Modal.info({
      icon: null,
      title: full_name,
      width: 800,
      content: (
        <div dangerouslySetInnerHTML={{ __html: prettyHtml(repo.repo) }} />
      ),
    });
  };

  return (
    // todo fix scroll position
    <div className="info-wrap">
      <div className="info-meta">
        <h2 className="info-top">
          <span className="info-star-icon" onClick={handleStarIconClick}>
            <Icon type="star" theme={starred ? 'filled' : 'outlined'} />
          </span>
          <span className="info-repo-title" title={full_name}>
            <a
              className="info-repo-github-link"
              href={html_url}
              target="_blank"
            >
              {full_name}
            </a>
          </span>
          <Button size="small" ghost onClick={handleMoreInfoBtnClick}>
            More Info
          </Button>
        </h2>

        <div className="info-bottom">
          <span className="info-tags-input">
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
              maxTagCount={5}
              maxTagTextLength={5}
              maxTagPlaceholder={`other ${selectedTagIds.length - 5} tags...`}
            >
              {tags &&
                tags.map(({ id, name }) => {
                  return <Option key={id}>{name}</Option>;
                })}
            </Select>
          </span>
          &nbsp; &nbsp;
          <span>
            <Tooltip placement="topLeft" title="Download Zip">
              <Button
                shape="circle"
                icon="download"
                onClick={handleDownloadZip}
              />
            </Tooltip>
            &nbsp;
            <Tooltip placement="topLeft" title="Clone with HTTPS">
              <Button shape="circle" icon="copy" onClick={handleCopyGitUrl} />
            </Tooltip>
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
