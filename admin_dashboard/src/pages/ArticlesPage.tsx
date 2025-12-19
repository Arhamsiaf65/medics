import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Card, Typography, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title } = Typography;
const { TextArea } = Input;

interface Article {
  id: string;
  title: string;
  source: string;
  readTime: string;
  imageUrl: string;
  content?: string;
  category?: string;
  createdAt: string;
}

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = async (file: File) => {
    const url = "https://api.cloudinary.com/v1_1/dtq2ycobw/image/upload";
    const preset = "medics";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const res = await fetch(url, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload failed");

    return data.secure_url;
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Only images are allowed");
    }
    return true; // Return true to continue with customRequest
  };

  const handleImageUpload = async ({ file }: any) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
      form.setFieldsValue({ imageUrl: url });
      message.success("Image uploaded!");
    } catch {
      message.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/articles');
      setArticles(response.data.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      message.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleAdd = () => {
    setEditingArticle(null);
    setImageUrl(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setImageUrl(article.imageUrl);
    form.setFieldsValue(article);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosClient.delete(`/articles/${id}`);
      message.success('Article deleted successfully');
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      message.error('Failed to delete article');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingArticle) {
        // Update
        await axiosClient.put(`/articles/${editingArticle.id}`, values);
        message.success('Article updated successfully');
      } else {
        // Create
        await axiosClient.post('/articles', values);
        message.success('Article created successfully');
      }

      setIsModalVisible(false);
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      // Form validation errors usually thrown here, so we don't necessarily need a generic error message if it's just validation
      if ((error as any).response) {
        message.error('Failed to save article');
      }
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url: string) => (
        <img
          src={url}
          alt="Article"
          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60?text=Error'; }}
        />
      ),
      width: 80,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 150,
    },
    {
      title: 'Read Time',
      dataIndex: 'readTime',
      key: 'readTime',
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Article) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete Article"
            description="Are you sure you want to delete this article?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>Health Articles</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchArticles}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Article
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title={editingArticle ? "Edit Article" : "Add New Article"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText={editingArticle ? "Update" : "Create"}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ readTime: '5 min read' }}
        >
          <Form.Item
            name="title"
            label="Article Title"
            rules={[{ required: true, message: 'Please enter article title' }]}
          >
            <Input placeholder="E.g. The Benefits of Daily Exercise" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="source"
              label="Source"
              rules={[{ required: true, message: 'Please enter source' }]}
            >
              <Input placeholder="E.g. Medical News Today" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
            >
              <Input placeholder="E.g. Fitness, Nutrition, Mental Health" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="readTime"
              label="Read Time"
              rules={[{ required: true, message: 'Please enter estimated read time' }]}
            >
              <Input placeholder="E.g. 5 min read" />
            </Form.Item>

            <Form.Item
              name="imageUrl"
              label="Article Image"
              rules={[{ required: true, message: 'Please upload an image' }]}
            >
              <Upload
                showUploadList={false}
                listType="picture-card"
                beforeUpload={beforeUpload}
                customRequest={handleImageUpload}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="article"
                    style={{ width: '100%', borderRadius: 8, height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div>
                    {uploading ? "Uploading..." : "+"}
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </div>

          <Form.Item
            name="content"
            label="Content / Summary"
            rules={[{ required: true, message: 'Please enter some content' }]}
          >
            <TextArea rows={6} placeholder="Enter article content or summary..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ArticlesPage;