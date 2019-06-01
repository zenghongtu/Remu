import * as React from 'react';

import Header from './components/Header';
import RepoBar from './components/RepoBar';
import RepoInfo from './components/RepoInfo';
import Sidebar from './components/Sidebar';
import './App.less';

const App = () => {
  return (
    <div>
      <div className="header">
        <Header />
      </div>
      <div className="main">
        <div className="col-item">
          <Sidebar />
        </div>
        <div className="col-item">
          <RepoBar />
        </div>
        <div className="col-item">
          <RepoInfo />
        </div>
      </div>
    </div>
  );
};

export default App;
