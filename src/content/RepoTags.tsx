import * as React from 'react';
import {
  ITag,
  STORAGE_TAGS,
  STORAGE_REPO,
  IRepoWithTag,
  TagId,
  RepoId,
  ITagsAction,
  IRepoWithNote,
  STORAGE_NOTES,
} from '../typings';
import SelectTags, { ISelectTagsProps } from './SelectTags';
import { useEffect, useState } from 'react';
import { localStoragePromise } from '../utils';
import { Popover, Input, Button, message } from 'antd';

const TextArea = Input.TextArea;

export interface IRepoTagsProps {
  repoId: RepoId;
  tags: ITag[];
  repoWithTags: IRepoWithTag;
  repoWithNotes: IRepoWithNote;
}
const RepoTags = (props: IRepoTagsProps) => {
  const { repoWithTags, repoWithNotes, repoId } = props;
  const [starred, setStarred] = useState(false);
  const [focusSelect, setFocusSelect] = useState(false);
  const [notesValue, setNotesValue] = useState<string>(
    repoWithNotes[repoId] || '',
  );

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
  const handleNotesPressEnter = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.ctrlKey) {
      const value = (e.target as HTMLTextAreaElement).value;
      const _repoWithNotes = { ...repoWithNotes, [repoId]: value };
      localStoragePromise.set({ [STORAGE_NOTES]: _repoWithNotes }).then(() => {
        message.success('Add notes successfully!');
      });
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotesValue(value);
  };

  return (
    <div className="-remu-content">
      {starred && (
        <>
          <Popover
            placement="bottomLeft"
            content={
              <div>
                <TextArea
                  rows={4}
                  value={notesValue}
                  onChange={handleNotesChange}
                  onPressEnter={handleNotesPressEnter}
                />
                <div className="-remu-notes-hotkey-hint">
                  Confirm by <b>Ctrl + Enter</b>
                </div>
              </div>
            }
          >
            <Button size="small" type="primary" icon="snippets"></Button>
          </Popover>
          &nbsp;
          <SelectTags isFocus={focusSelect} {...selectTagsProps} />
        </>
      )}
    </div>
  );
};

export default RepoTags;
