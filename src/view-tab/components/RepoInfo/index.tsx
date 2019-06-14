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
  Spin,
} from 'antd';
import prettyHtml from 'json-pretty-html';
import urlConvert from 'url-convert';
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
  const [loading, setLoading] = useState<boolean>(false);

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
    setLoading(true);
    getReadmeHTML({ full_name, token })
      .then((rsp) => {
        const htmlString = rsp.data;
        const content = fixRelativeUrl(htmlString, repo);
        setContent(content);
      })
      .finally(() => {
        setLoading(false);
      });

    if (!unStarredRepos.includes(id)) {
      setStarred(true);
    } else {
      setStarred(false);
    }
  }, [repo]);

  const fixRelativeUrl = (htmlString: string, { repo }: IStarredRepo) => {
    const _site = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}`;

    const converted = urlConvert({ htmlString, baseUrl: _site });
    return converted;
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
      // ignore existing tags
      if (tags.find((item) => item.name === value)) {
        message.warn('Duplicate tag!');
        return;
      }
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
          <span
            className="info-star-icon"
            title="unStarred"
            onClick={handleStarIconClick}
          >
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

          <span className="info-repo-fn">
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
              loading={loading}
              maxTagCount={4}
              maxTagTextLength={5}
              maxTagPlaceholder={`other ${selectedTagIds.length - 5} tags...`}
            >
              {tags &&
                tags.map(({ id, name }) => {
                  return <Option key={id}>{name}</Option>;
                })}
            </Select>
          </span>
          &nbsp;
          <Button size="small" onClick={handleMoreInfoBtnClick}>
            More Info
          </Button>
        </div>
      </div>
      <div className="info-content">
        {loading ? (
          <div className="spin-wrap">
            <Spin
              tip={`Loading...`}
              delay={100}
              indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
            />
          </div>
        ) : content ? (
          <article
            className="markdown"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
};

export default RepoInfo;
