import * as React from 'react';
import * as echarts from 'echarts';
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
  Token,
} from '../typings';
import SelectTags, { ISelectTagsProps } from './SelectTags';
import { useEffect, useState } from 'react';
import { localStoragePromise } from '../utils';
import { Popover, Input, Button, message, Icon } from 'antd';
import getStarHistory from './getStarHistory';

const TextArea = Input.TextArea;

export interface IRepoTagsProps {
  repoId: RepoId;
  token: Token;
  repoNwo: string;
  tags: ITag[];
  caseSensitivity: boolean;
  repoWithTags: IRepoWithTag;
  repoWithNotes: IRepoWithNote;
}
const RepoTags = (props: IRepoTagsProps) => {
  const { repoWithTags, repoWithNotes, repoId, repoNwo, token } = props;
  const [starred, setStarred] = useState(false);
  const [focusSelect, setFocusSelect] = useState(false);
  const [notesValue, setNotesValue] = useState<string>(
    repoWithNotes[repoId] || '',
  );
  const [starHistory, setStarHistory] = useState(null);

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

  useEffect(() => {
    if (!starHistory) {
      return;
    }

    const xData = [];
    const yData = [];
    starHistory.forEach((item) => {
      xData.push(item.date);
      yData.push(item.starNum);
    });
    const option = {
      title: {
        text: 'Star Hisotry',
      },
      tooltip: {},
      legend: {
        data: [repoNwo],
      },
      xAxis: {
        data: xData,
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: repoNwo,
          data: yData,
          type: 'line',
        },
      ],
    };

    setTimeout(() => {
      const el = document.getElementById('-remu-main');
      const myChart = echarts.init(el);
      myChart.setOption(option);
    });
  }, [starHistory]);

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

  const handleClickStarHistoryBtn = async () => {
    if (starHistory) {
      return;
    }

    try {
      const starHistory = await getStarHistory(repoNwo, token);
      setStarHistory(starHistory);
    } catch (e) {
      message.error(e.message);
      // tslint:disable-next-line:no-console
      console.log(e);
    }
  };

  return (
    <div className="-remu-content">
      {/*
                    // @ts-ignore */}
      <Popover
        placement="bottomLeft"
        trigger={'click'}
        onClick={handleClickStarHistoryBtn}
        content={
          <div>
            {starHistory ? (
              <div
                id="-remu-main"
                style={{ width: '600px', height: '400px' }}
              ></div>
            ) : (
              <span>
                <h4>Star History </h4>
                {/*
                    // @ts-ignore */}
                loading <dot>...</dot>
              </span>
            )}
          </div>
        }
      >
        <Button icon="history"></Button>
      </Popover>
      &nbsp;
      {starred && (
        <>
          <Popover
            placement="bottomLeft"
            trigger={'click'}
            content={
              <div>
                <h4>Notes</h4>
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
            <Button icon="snippets"></Button>
          </Popover>
          &nbsp;
          <SelectTags isFocus={focusSelect} {...selectTagsProps} />
        </>
      )}
    </div>
  );
};

export default RepoTags;
