import * as React from 'react';
import { Layout } from 'antd';
import './App.less';

const { Header, Footer, Sider, Content } = Layout;

const App = () => {
  return (
    <div>
      <Header>Header</Header>
      <Layout>
        <Sider>Sider</Sider>
        <Content>Content</Content>
      </Layout>
    </div>
  );
};

export default App;
