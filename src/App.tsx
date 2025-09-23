import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Layout from './components/Layout';
import RulesList from './pages/RulesList';
import RuleEditor from './pages/RuleEditor';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<RulesList />} />
            <Route path="/rules" element={<RulesList />} />
            <Route path="/rules/new" element={<RuleEditor />} />
            <Route path="/rules/:id" element={<RuleEditor />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App
