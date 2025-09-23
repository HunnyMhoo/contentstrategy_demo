import React from 'react';
import { Table, Button, Tag, Space, Typography, Card } from 'antd';
import { PlusOutlined, EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface Rule {
  id: string;
  name: string;
  status: 'Draft' | 'Active' | 'Inactive';
  audienceSummary: string;
  schedule: string;
  lastModified: string;
}

const RulesList: React.FC = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockRules: Rule[] = [
    {
      id: 'rule_001',
      name: 'Show TL first',
      status: 'Draft',
      audienceSummary: 'Targeted Lead = true AND Risk Band in [Balanced, Aggressive]',
      schedule: 'Daily 08:00-22:00 (Asia/Bangkok)',
      lastModified: '2025-09-23 14:30',
    },
    {
      id: 'rule_002',
      name: 'High AUM Investment Focus',
      status: 'Active',
      audienceSummary: 'AUM Band = "5–20M" AND Offering Types includes "Investment"',
      schedule: 'Weekdays 09:00-18:00 (Asia/Bangkok)',
      lastModified: '2025-09-22 16:45',
    },
    {
      id: 'rule_003',
      name: 'Beginner Education Content',
      status: 'Active',
      audienceSummary: 'Persona = "Beginner" AND Last Click > 30 days',
      schedule: 'Always Active',
      lastModified: '2025-09-21 11:20',
    },
    {
      id: 'rule_004',
      name: 'Cautious Investor Savings',
      status: 'Inactive',
      audienceSummary: 'Risk Band = "Cautious" AND Offering Types includes "Savings"',
      schedule: 'Weekends 10:00-20:00 (Asia/Bangkok)',
      lastModified: '2025-09-20 09:15',
    },
    {
      id: 'rule_005',
      name: 'HNWI Premium Offers',
      status: 'Draft',
      audienceSummary: 'AUM Band = "20M+" AND Persona = "HNWI"',
      schedule: 'Business Hours (Asia/Bangkok)',
      lastModified: '2025-09-19 13:10',
    },
  ];

  const getStatusColor = (status: Rule['status']) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Draft':
        return 'processing';
      case 'Inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<Rule> = [
    {
      title: 'Rule Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name, record) => (
        <Button 
          type="link" 
          className="p-0 h-auto font-medium text-blue-600"
          onClick={() => navigate(`/rules/${record.id}`)}
        >
          {name}
        </Button>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Audience Summary',
      dataIndex: 'audienceSummary',
      key: 'audienceSummary',
      ellipsis: true,
      render: (text) => (
        <span className="text-gray-600 text-sm">{text}</span>
      ),
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      width: 200,
      render: (text) => (
        <span className="text-gray-600 text-sm">{text}</span>
      ),
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
      width: 150,
      render: (text) => (
        <span className="text-gray-500 text-sm">{text}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/rules/${record.id}`)}
            title="Edit Rule"
          />
          <Button
            type="text"
            icon={<CopyOutlined />}
            size="small"
            onClick={() => console.log('Duplicate rule:', record.id)}
            title="Duplicate Rule"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => console.log('Delete rule:', record.id)}
            title="Delete Rule"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!mb-2">Rules</Title>
          <p className="text-gray-600 m-0">
            Manage your rule configurations for the "For You" placement
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate('/rules/new')}
          className="shadow-sm"
        >
          Create New Rule
        </Button>
      </div>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={mockRules}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} rules`,
          }}
          scroll={{ x: 800 }}
          className="ant-table-responsive"
        />
      </Card>
    </div>
  );
};

export default RulesList;
