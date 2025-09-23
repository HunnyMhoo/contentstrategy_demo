import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Typography, Card, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { Rule } from '../lib/mockData';
import { rulesApi } from '../services/rulesApi';

const { Title } = Typography;

const RulesList: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo telemetry logging
  const logDemoEvent = (eventName: string, data?: any) => {
    console.log(`[Demo Event] ${eventName}`, data);
  };

  // Fetch rules from API
  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await rulesApi.getAllRules();
      if (response.success && response.data) {
        setRules(response.data.rules);
        logDemoEvent('rules_list_page_load', { rulesCount: response.data.rules.length });
      } else {
        message.error(response.error || 'Failed to fetch rules');
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
      message.error('Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Handle rule duplication
  const handleDuplicate = async (ruleId: string) => {
    try {
      const response = await rulesApi.duplicateRule(ruleId);
      if (response.success) {
        message.success('Rule duplicated successfully');
        fetchRules(); // Refresh the list
        logDemoEvent('rule_duplicate_success', { ruleId });
      } else {
        message.error(response.error || 'Failed to duplicate rule');
      }
    } catch (error) {
      console.error('Error duplicating rule:', error);
      message.error('Failed to duplicate rule');
    }
  };

  // Handle rule deletion
  const handleDelete = async (ruleId: string) => {
    try {
      const response = await rulesApi.deleteRule(ruleId);
      if (response.success) {
        message.success('Rule deleted successfully');
        fetchRules(); // Refresh the list
        logDemoEvent('rule_delete_success', { ruleId });
      } else {
        message.error(response.error || 'Failed to delete rule');
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      message.error('Failed to delete rule');
    }
  };

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

  const getContentSourceColor = (source: string) => {
    switch (source) {
      case 'TargetedLead':
        return 'gold';
      case 'ProductReco':
        return 'blue';
      case 'CMS':
        return 'default';
      default:
        return 'default';
    }
  };

  const renderContentSources = (sources: string[]) => {
    return (
      <Space size="small" wrap>
        {sources.map((source) => (
          <Tag 
            key={source} 
            color={getContentSourceColor(source)}
            className="text-xs"
          >
            {source === 'TargetedLead' ? 'Targeted Lead' : 
             source === 'ProductReco' ? 'Product Reco' : 
             'CMS'}
          </Tag>
        ))}
      </Space>
    );
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
          onClick={() => {
            logDemoEvent('rule_list_click', { ruleId: record.id, ruleName: name });
            navigate(`/rules/${record.id}`);
          }}
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
      title: 'Content Sources',
      dataIndex: 'contentSources',
      key: 'contentSources',
      width: 180,
      render: (sources) => renderContentSources(sources),
    },
    {
      title: 'Schedule',
      key: 'schedule',
      width: 200,
      render: (_, record) => {
        const startDate = new Date(record.startDate).toLocaleDateString();
        const endDate = new Date(record.endDate).toLocaleDateString();
        return (
          <span className="text-gray-600 text-sm">
            {startDate} - {endDate}
          </span>
        );
      },
    },
    {
      title: 'Last Modified',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (text) => (
        <span className="text-gray-500 text-sm">
          {new Date(text).toLocaleDateString()}
        </span>
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
            onClick={() => {
              logDemoEvent('rule_edit_click', { ruleId: record.id });
              navigate(`/rules/${record.id}`);
            }}
            title="Edit Rule"
          />
          <Button
            type="text"
            icon={<CopyOutlined />}
            size="small"
            onClick={() => {
              logDemoEvent('rule_duplicate_click', { ruleId: record.id });
              handleDuplicate(record.id);
            }}
            title="Duplicate Rule"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => {
              logDemoEvent('rule_delete_click', { ruleId: record.id });
              handleDelete(record.id);
            }}
            title="Delete Rule"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
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
          onClick={() => {
            logDemoEvent('create_rule_click', { source: 'rules_list' });
            navigate('/rules/new');
          }}
          className="shadow-sm sm:flex-shrink-0"
        >
          Create New Rule
        </Button>
      </div>

      <Card className="shadow-sm">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={rules}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} rules`,
            }}
            scroll={{ x: 1000 }}
            className="ant-table-responsive"
          />
        </Spin>
      </Card>
    </div>
  );
};

export default RulesList;
