import * as React from 'react';
import { IStarredRepo } from '../../typings';
import { useState, useEffect } from 'react';
import { getReadmeHTML } from '../../service';
import 'github-markdown-css';
import './index.less';

interface IRepoInfo {
  repo: IStarredRepo;
}

const RepoInfo = ({ repo }: IRepoInfo) => {
  if (!repo) {
    // todo use image
    return <div>none</div>;
  }
  const [content, setContent] = useState('');

  useEffect(() => {
    getReadmeHTML({ full_name }).then((rsp) => {
      const data = rsp.data;
      setContent(data);
    });
  }, [repo]);

  const {
    starred_at,
    repo: { full_name, created_at, updated_at },
  } = repo;

  return (
    // todo fix scroll position
    <div className="info_wrap">
      <div>
        <h2>{full_name}</h2>
        <div>
          {created_at} {updated_at} {starred_at}
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
