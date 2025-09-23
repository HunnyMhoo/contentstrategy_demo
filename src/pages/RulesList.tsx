import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Typography, Card, message, Spin, Badge, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, CopyOutlined, DeleteOutlined, TrophyOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { Rule } from '../lib/mockData';
import { rulesApi } from '../services/rulesApi';
import PreviewSection from '../features/rules/components/PreviewSection';

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


  const renderContentSources = (_sources: string[], record: Rule) => {
    const contentFiles = record.contentFiles || [];
    
    return (
      <div>
        {/* CMS Content Files */}
        {contentFiles.length > 0 ? (
          <Space size="small" wrap>
            {contentFiles.map((file, index) => (
              <Tooltip key={index} title={`CMS Content File: ${file}`}>
                <Tag 
                  icon={<FileTextOutlined />}
                  className="text-xs bg-gray-50 border-gray-200 text-gray-700"
                >
                  {file.replace('.cms', '')}
                </Tag>
              </Tooltip>
            ))}
          </Space>
        ) : (
          <span className="text-gray-400 text-sm italic">No content files</span>
        )}
      </div>
    );
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 90) return '#f50'; // High priority - red
    if (priority >= 75) return '#fa8c16'; // Medium-high - orange  
    if (priority >= 60) return '#faad14'; // Medium - yellow
    return '#52c41a'; // Low priority - green
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 90) return 'High';
    if (priority >= 75) return 'Med-High';
    if (priority >= 60) return 'Medium';
    return 'Low';
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
          className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
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
      title: (
        <Space>
          <TrophyOutlined />
          Priority
        </Space>
      ),
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      sorter: (a, b) => a.priority - b.priority,
      sortDirections: ['descend', 'ascend'],
      defaultSortOrder: 'descend',
      render: (priority) => (
        <div className="flex items-center space-x-2">
          <Badge 
            count={priority} 
            style={{ 
              backgroundColor: getPriorityColor(priority),
              fontWeight: 'bold',
              minWidth: '28px'
            }} 
          />
          <span className="text-xs text-gray-500 font-medium">
            {getPriorityLabel(priority)}
          </span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)} className="font-medium">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Audience Summary',
      dataIndex: 'audienceSummary',
      key: 'audienceSummary',
      ellipsis: true,
      render: (text) => (
        <span className="text-gray-600 text-sm leading-relaxed">{text}</span>
      ),
    },
    {
      title: 'Content Sources',
      dataIndex: 'contentSources',
      key: 'contentSources',
      width: 240,
      render: (sources, record) => renderContentSources(sources, record),
    },
    {
      title: 'Schedule',
      key: 'schedule',
      width: 180,
      render: (_, record) => {
        const startDate = new Date(record.startDate).toLocaleDateString();
        const endDate = new Date(record.endDate).toLocaleDateString();
        return (
          <div className="text-gray-600 text-sm">
            <div className="font-medium">{startDate}</div>
            <div className="text-gray-400">to {endDate}</div>
          </div>
        );
      },
    },
    {
      title: 'Last Modified',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 140,
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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <Title level={2} className="!mb-2 text-gray-800">Rules</Title>
          <p className="text-gray-600 m-0 text-base">
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
          className="shadow-md sm:flex-shrink-0 bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 h-10 px-6"
        >
          Create New Rule
        </Button>
      </div>

      <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
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
              className: "px-4 py-3 bg-gray-50"
            }}
            scroll={{ x: 1200 }}
            className="rules-table"
            rowClassName="hover:bg-blue-50 transition-colors duration-200"
            size="middle"
          />
        </Spin>
      </Card>

      {/* Preview Section */}
      <PreviewSection rules={rules} />
      
      <style>{`
        .rules-table .ant-table-thead > tr > th {
          background-color: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
          font-weight: 600;
          color: #374151;
          padding: 16px 12px;
        }
        
        .rules-table .ant-table-tbody > tr > td {
          padding: 16px 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .rules-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none;
        }
        
        .rules-table .ant-table-row:hover {
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

export default RulesList;
