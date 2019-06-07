import * as React from 'react';
import {
  ITag,
  STORAGE_TAGS,
  STORAGE_REPO,
  IRepoWithTag,
  TagId,
  RepoId,
  ITagsAction,
} from '../typings';
import SelectTags, { ISelectTagsProps } from './SelectTags';
import { useEffect, useState } from 'react';
import { localStoragePromise } from '../utils';

export interface IRepoTagsProps {
  repoId: RepoId;
  tags: ITag[];
  repoWithTags: IRepoWithTag;
}
const RepoTags = (props: IRepoTagsProps) => {
  const { repoWithTags, repoId } = props;
  const [starred, setStarred] = useState(false);
  const [focusSelect, setFocusSelect] = useState(false);

  const selectTagsProps: ISelectTagsProps = { ...props };

  useEffect(() => {
    const starringContainer = document.querySelector('.starring-container');
    const isStarred = starringContainer.className.includes(' on');
    setStarred(isStarred);

    starringContainer.addEventListener('click', handleStaringClick);
    return () => {
      starringContainer.removeEventListener('click', handleStaringClick);
    };
    // fix starred effect
  }, [starred]);

  const handleStaringClick = (e) => {
    if (starred) {
      if (repoWithTags[repoId]) {
        delete repoWithTags[repoId];
        const newRepoWithTags = { ...repoWithTags };
        localStoragePromise
          .set({
            [STORAGE_REPO]: newRepoWithTags,
          })
          .then(() => {
            setStarred(!starred);
          })
          .catch((e) => {
            // todo
            // tslint:disable-next-line:no-console
            console.error('errors: ', e);
          });
        return;
      }
    }
    setFocusSelect(true);
    setStarred(!starred);
  };
  return (
    <div className="-remu-content">
      {starred && <SelectTags isFocus={focusSelect} {...selectTagsProps} />}
    </div>
  );
};

export default RepoTags;
