import * as React from 'react';
import {
  Form,
  Input,
  Tooltip,
  Icon,
  Cascader,
  Select,
  Row,
  Col,
  Checkbox,
  Button,
  Spin,
  AutoComplete,
  message,
  Modal,
  Switch,
} from 'antd';

import './App.less';
import { useEffect, useState, useRef } from 'react';
import { syncStoragePromise, localStoragePromise } from '../utils';
import {
  STORAGE_SETTINGS,
  STORAGE_TOKEN,
  STORAGE_GIST_UPDATE_TIME,
  STORAGE_GIST_ID,
  STORAGE_REPO,
  STORAGE_TAGS,
  IMessageAction,
  IResponseMsg,
  STORAGE_README_CACHE,
  STORAGE_CASE_SENSITIVITY,
} from '../typings';
import {
  DEFAULT_SYNCHRONIZING_DELAY,
  DEFAULT_SHOW_WATCH,
  DEFAULT_CASE_SENSITIVITY,
} from '../constants';

const { Option } = Select;

const SFSelectOptions = [
  { value: '0', label: 'immediate (close delay)' },
  { value: '6000', label: '6 seconds' },
  { value: '30000', label: '30 seconds' },
  { value: '60000', label: '60 seconds' },
  { value: '300000', label: '5 minutes' },
  { value: '600000', label: '10 minutes' },
  { value: '1800000', label: '30 minutes' },
  { value: '3600000', label: '1 hour' },
  { value: '7200000', label: '2 hours' },
  { value: '18000000', label: '5 hours' },
];

interface IFormSettings {
  synchronizingDelay: string;
  showWatch: boolean;
  searchReadme: boolean;
  token: string;
  gistId: string;
  gistUpdateTime: string;
  caseSensitivity: boolean;
}

const saveSyncStorage = (key: string, value: any) => {
  syncStoragePromise
    .set({
      [key]: value,
    })
    .then(() => {
      const action: IMessageAction = {
        type: 'refresh',
      };
      sendMessage(action);
    });
};

const fileDownload = (content: string, filename: string) => {
  const eleLink = document.createElement('a');
  eleLink.download = filename;
  eleLink.style.display = 'none';
  const blob = new Blob([content]);
  eleLink.href = URL.createObjectURL(blob);
  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
};

const sendMessage = (action: IMessageAction) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(action, function(response: IResponseMsg) {
      if (response.status === 'error') {
        message.error(`${action.type} Error!`, 1);
        reject(response);
      } else if (response.status === 'success') {
        message.success(`${action.type} Successfully!`, 1);
        resolve(response);
      }
    });
  });
};

const SettingForm = () => {
  const [settings, setSettings] = useState<IFormSettings>(null);
  const [refresh, setRefresh] = useState<number>(0);
  const tokenInputRef = useRef(null);
  const gistIdInputRef = useRef(null);

  useEffect(() => {
    syncStoragePromise
      .get({
        [STORAGE_SETTINGS]: {
          synchronizingDelay: DEFAULT_SYNCHRONIZING_DELAY,
          showWatch: DEFAULT_SHOW_WATCH,
          caseSensitivity: DEFAULT_CASE_SENSITIVITY,
        },
        [STORAGE_GIST_ID]: '',
        [STORAGE_TOKEN]: '',
        [STORAGE_GIST_UPDATE_TIME]: '',
      })
      .then((result) => {
        const _settings = (result as any)[STORAGE_SETTINGS];
        const gistId = (result as any)[STORAGE_GIST_ID];
        const token = (result as any)[STORAGE_TOKEN];
        const gistUpdateTime = (result as any)[STORAGE_GIST_UPDATE_TIME];
        const settings = {
          ..._settings,
          token,
          gistId,
          gistUpdateTime,
        };
        setSettings(settings);
      });
  }, [refresh]);

  const handleUpdateToken = () => {
    const value = tokenInputRef.current.state.value;
    if (value) {
      saveSyncStorage(STORAGE_TOKEN, value);
    }
  };

  const handleUpdateGistId = () => {
    const value = gistIdInputRef.current.state.value;
    if (value) {
      saveSyncStorage(STORAGE_GIST_ID, value);
    }
  };

  const handleSFSelectChange = (value: string) => {
    saveSyncStorage(STORAGE_SETTINGS, { synchronizingDelay: value });
  };

  const handleExportData = () => {
    localStoragePromise
      .get({ [STORAGE_REPO]: {}, [STORAGE_TAGS]: [] })
      .then((result) => {
        const content = JSON.stringify(result);
        const filename = `remu-export-data_${+new Date()}.json`;
        fileDownload(content, filename);
      });
  };
  const handleImportData = () => {};

  const handleClearData = () => {
    Modal.confirm({
      icon: 'exclamation-circle',
      title: 'Make sure you want to clear the All Data!',
      onOk() {
        localStoragePromise.clear().then(() => {
          syncStoragePromise.clear().then(() => {
            location.reload();
          });
        });
      },
    });
  };

  const handleUpdateGist = async () => {
    sendMessage({ type: 'updateGist' }).then(() => {
      setRefresh(refresh + 1);
    });
  };

  const handleUpdateLocal = async () => {
    sendMessage({ type: 'updateLocal' }).then(() => {
      setRefresh(refresh + 1);
    });
  };

  const handleSwitchWatch = async (value) => {
    syncStoragePromise
      .set({
        [STORAGE_SETTINGS]: {
          ...settings,
          showWatch: value,
        },
      })
      .then(() => {
        message.success('Success!', 1);
        setRefresh(refresh + 1);
      });
  };

  const handleSwitchSearchReadme = async (value) => {
    syncStoragePromise
      .set({
        [STORAGE_SETTINGS]: {
          ...settings,
          searchReadme: value,
        },
      })
      .then(() => {
        message.success('Success!', 1);
        setRefresh(refresh + 1);
      });
  };
  const handleSwitchCaseSensitivity = async (value) => {
    syncStoragePromise
      .set({
        [STORAGE_SETTINGS]: {
          ...settings,
          caseSensitivity: value,
        },
      })
      .then(() => {
        message.success('Success!', 1);
        setRefresh(refresh + 1);
      });
  };

  const handleClearReadmeCache = async () => {
    const data = await localStoragePromise.get(null);
    const result = {};
    Object.keys(data).filter((key) => {
      if (key.indexOf('_readme_') !== 0) {
        result[key] = data[key];
      }
    });
    await localStoragePromise.clear();
    await localStoragePromise.set(result);
    message.success('Cache Clearance Successful');
  };

  return (
    <div className="form-wrap">
      {settings ? (
        <div className="form">
          <div className="form-item">
            <div className="form-item-label">Sync Data (need Gist Id):</div>
            <i>
              Gist update time:
              <b>{settings.gistUpdateTime || 'Unsynchronized'}</b>
            </i>
            <div>
              <Button icon="cloud-upload" onClick={handleUpdateGist}>
                Update Gist
              </Button>
              &nbsp; &nbsp;
              <Button icon="cloud-download" onClick={handleUpdateLocal}>
                Update Local
              </Button>
            </div>
          </div>
          <div className="form-item">
            <div className="form-item-label">Synchronizing Delay:</div>
            <Select
              defaultValue={settings.synchronizingDelay}
              onChange={handleSFSelectChange}
              style={{ width: '50%' }}
            >
              {SFSelectOptions &&
                SFSelectOptions.map(({ value, label }) => {
                  return (
                    <Option key={value} value={value}>
                      {label}
                    </Option>
                  );
                })}
            </Select>
          </div>
          <div className="form-item">
            <div className="form-item-label">
              Show Watching Repositories(<b>Will be slow</b>):
            </div>
            <Switch checked={settings.showWatch} onChange={handleSwitchWatch} />
          </div>
          <div className="form-item">
            <div className="form-item-label">Case Sensivivity:</div>
            <Switch
              checked={settings.caseSensitivity}
              onChange={handleSwitchCaseSensitivity}
            />
          </div>
          <div className="form-item">
            <div className="form-item-label">
              <Tooltip title="whether to use readme content to search">
                Search Readme(<b>Will be slower</b>):
              </Tooltip>
            </div>
            <Switch
              checked={settings.searchReadme}
              onChange={handleSwitchSearchReadme}
            />
            <Button
              type="primary"
              className="form-item-clearCache"
              onClick={handleClearReadmeCache}
            >
              wipe cache
            </Button>
            {/* // todo cache */}
            {/* <div>
              <Button
                onClick={() => {
                  localStoragePromise.remove(STORAGE_README_CACHE).then(() => {
                    message.success('Cache Clearance Successful');
                  });
                }}
                type="danger"
              >
                wipe cache
              </Button>
            </div> */}
          </div>
          <div className="form-item">
            <div className="form-item-label">
              <a href="https://github.com/settings/tokens">
                Github Personal Access Token:
              </a>
            </div>
            <div className="form-item-input">
              <Input ref={tokenInputRef} defaultValue={settings.token}></Input>
              &nbsp; &nbsp;
              <Button type="primary" onClick={handleUpdateToken}>
                Update
              </Button>
            </div>
          </div>
          <div className="form-item">
            <div className="form-item-label">
              <a href="https://gist.github.com">Gist Id:</a>
            </div>
            <div className="form-item-input">
              <Input
                ref={gistIdInputRef}
                defaultValue={settings.gistId}
              ></Input>
              &nbsp; &nbsp;
              <Button type="primary" onClick={handleUpdateGistId}>
                Update
              </Button>
            </div>
          </div>
          <div className="form-item">
            <div className="form-item-label">
              Export/Import Data (JSON Format):
            </div>
            <div>
              <Button type="primary" onClick={handleExportData}>
                Export
              </Button>
              &nbsp; &nbsp;
              <Button type="primary" disabled onClick={handleImportData}>
                Import
              </Button>
            </div>
          </div>
          <div className="form-item">
            <div className="form-item-label">Clear All Data:</div>
            <div>
              <Button type="danger" onClick={handleClearData}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Spin></Spin>
      )}
    </div>
  );
};

export default SettingForm;
