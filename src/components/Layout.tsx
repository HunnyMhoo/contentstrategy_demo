import React from 'react';
import { Layout as AntLayout, Menu, Typography, Breadcrumb } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { SettingOutlined, HomeOutlined } from '@ant-design/icons';

const { Header, Content } = AntLayout;
const { Title } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/rules',
      icon: <HomeOutlined />,
      label: 'Rules',
      onClick: () => navigate('/rules'),
    },
  ];

  const getBreadcrumbItems = () => {
    const path = location.pathname;
    const items = [
      {
        title: (
          <span className="flex items-center">
            <SettingOutlined className="mr-1" />
            KPlus Rule Configuration
          </span>
        ),
      },
    ];

    if (path === '/rules' || path === '/') {
      items.push({ title: <span>Rules</span> });
    } else if (path === '/rules/new') {
      items.push(
        { title: <a onClick={() => navigate('/rules')}>Rules</a> },
        { title: <span>New Rule</span> }
      );
    } else if (path.startsWith('/rules/')) {
      const ruleId = path.split('/')[2];
      items.push(
        { title: <a onClick={() => navigate('/rules')}>Rules</a> },
        { title: <span>Edit Rule {ruleId}</span> }
      );
    }

    return items;
  };

  return (
    <AntLayout className="min-h-screen">
      <Header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4">
          <div className="flex items-center">
            <Title 
              level={3} 
              className="!mb-0 !text-gray-800 cursor-pointer"
              onClick={() => navigate('/rules')}
            >
              KPlus Rule Configuration Demo
            </Title>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-0 bg-transparent min-w-0"
          />
        </div>
      </Header>
      
      <Content className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Breadcrumb 
            items={getBreadcrumbItems()} 
            className="mb-6"
          />
          <div className="bg-white rounded-lg shadow-sm min-h-[600px]">
            {children}
          </div>
        </div>
      </Content>
    </AntLayout>
  );
};

export default Layout;
