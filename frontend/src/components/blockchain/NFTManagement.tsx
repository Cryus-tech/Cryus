import React, { useState, useEffect } from 'react';
import { Tabs, Card, Form, Input, Button, Switch, InputNumber, Select, Upload, Table, Tag, message, Spin, Alert, Modal, Typography, Space, Row, Col } from 'antd';
import { PlusOutlined, SendOutlined, EditOutlined, UploadOutlined, CopyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import type { UploadFile } from 'antd/es/upload/interface';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface NFT {
  name: string;
  symbol: string;
  uri: string;
  nftAddress: string;
  owner: string;
  royaltyPercentage: number;
  isMutable: boolean;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: {
      trait_type: string;
      value: string;
    }[];
  };
  createdAt: string;
}

const NFTManagement: React.FC = () => {
  const [createForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedNft, setSelectedNft] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [attributes, setAttributes] = useState<{trait_type: string, value: string}[]>([]);

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/blockchain/nfts');
      setNfts(response.data.data.nfts);
      setError(null);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('Failed to load NFTs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    try {
      setUploadingImage(true);
      // Create form data
      const formData = new FormData();
      formData.append('image', file);

      // Upload to your backend or IPFS
      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Get the image URL from response
      const imageUrl = response.data.imageUrl;
      setImageUrl(imageUrl);
      message.success('Image uploaded successfully!');
      
      return imageUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      message.error('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateNFT = async (values: any) => {
    try {
      setSubmitting(true);
      
      // Create metadata
      const metadata = {
        name: values.name,
        description: values.description,
        image: imageUrl,
        attributes: attributes,
      };

      // Upload metadata to IPFS
      const metadataResponse = await axios.post('/api/upload/metadata', {
        metadata,
      });
      
      const metadataUri = metadataResponse.data.uri;
      
      // Create NFT
      const response = await axios.post('/api/blockchain/nft/create', {
        name: values.name,
        symbol: values.symbol,
        uri: metadataUri,
        royaltyPercentage: values.royaltyPercentage,
        isMutable: values.isMutable,
      });

      message.success('NFT created successfully!');
      createForm.resetFields();
      setFileList([]);
      setImageUrl('');
      setAttributes([]);
      fetchNFTs();
      
      // Show NFT details in modal
      Modal.success({
        title: 'NFT Created Successfully',
        content: (
          <div>
            <p>Your NFT has been created with the following details:</p>
            <p><strong>NFT Address:</strong> {response.data.data.nftAddress}</p>
            <p><strong>Transaction Signature:</strong> {response.data.data.signature}</p>
            <p><strong>Metadata URI:</strong> {metadataUri}</p>
          </div>
        ),
      });
    } catch (err) {
      console.error('Error creating NFT:', err);
      message.error('Failed to create NFT. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferNFT = async (values: any) => {
    try {
      setSubmitting(true);
      const response = await axios.post('/api/blockchain/nft/transfer', {
        nftAddress: values.nftAddress,
        newOwnerAddress: values.newOwnerAddress,
      });

      message.success('NFT transferred successfully!');
      transferForm.resetFields();
      fetchNFTs();
    } catch (err) {
      console.error('Error transferring NFT:', err);
      message.error('Failed to transfer NFT. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNFT = async (values: any) => {
    try {
      setSubmitting(true);
      const response = await axios.post('/api/blockchain/nft/update-metadata', {
        nftAddress: values.nftAddress,
        name: values.name,
        symbol: values.symbol,
        uri: values.uri,
      });

      message.success('NFT metadata updated successfully!');
      updateForm.resetFields();
      fetchNFTs();
    } catch (err) {
      console.error('Error updating NFT:', err);
      message.error('Failed to update NFT. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
    if (fileList.length > 0 && fileList[0].status === 'done' && fileList[0].response) {
      setImageUrl(fileList[0].response.imageUrl);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleCancel = () => setPreviewOpen(false);

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][field] = value;
    setAttributes(updatedAttributes);
  };

  const removeAttribute = (index: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes.splice(index, 1);
    setAttributes(updatedAttributes);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: ['metadata', 'image'],
      key: 'image',
      render: (image: string) => (
        <img 
          src={image} 
          alt="NFT" 
          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'NFT Address',
      dataIndex: 'nftAddress',
      key: 'nftAddress',
      render: (text: string) => (
        <Space>
          <Text ellipsis style={{ maxWidth: 150 }}>{text}</Text>
          <Button 
            type="text" 
            icon={<CopyOutlined />} 
            onClick={() => copyToClipboard(text)}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      render: (text: string) => (
        <Text ellipsis style={{ maxWidth: 150 }}>{text}</Text>
      ),
    },
    {
      title: 'Mutable',
      dataIndex: 'isMutable',
      key: 'isMutable',
      render: (isMutable: boolean) => (
        isMutable ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record: NFT) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<InfoCircleOutlined />}
            onClick={() => showNFTDetails(record)}
          >
            Details
          </Button>
          <Button 
            type="link" 
            icon={<SendOutlined />}
            onClick={() => preTransferNFT(record)}
          >
            Transfer
          </Button>
          {record.isMutable && (
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => preUpdateNFT(record)}
            >
              Update
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const showNFTDetails = (nft: NFT) => {
    Modal.info({
      title: `${nft.name} Details`,
      width: 600,
      content: (
        <div style={{ marginTop: '20px' }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <img 
                src={nft.metadata.image} 
                alt={nft.name}
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </Col>
            <Col span={16}>
              <Title level={4}>{nft.name} ({nft.symbol})</Title>
              <Paragraph>{nft.metadata.description}</Paragraph>
              <Text strong>NFT Address: </Text>
              <Paragraph copyable>{nft.nftAddress}</Paragraph>
              <Text strong>Owner: </Text>
              <Paragraph copyable>{nft.owner}</Paragraph>
              <Text strong>Royalty: </Text>
              <Paragraph>{nft.royaltyPercentage}%</Paragraph>
              <Text strong>Mutable: </Text>
              <Paragraph>{nft.isMutable ? 'Yes' : 'No'}</Paragraph>
              <Text strong>Metadata URI: </Text>
              <Paragraph copyable>{nft.uri}</Paragraph>
            </Col>
          </Row>
          {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
            <>
              <Title level={5} style={{ marginTop: '16px' }}>Attributes</Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {nft.metadata.attributes.map((attr, index) => (
                  <Tag key={index} color="blue">
                    {attr.trait_type}: {attr.value}
                  </Tag>
                ))}
              </div>
            </>
          )}
        </div>
      ),
      onOk() {},
    });
  };

  const preTransferNFT = (nft: NFT) => {
    transferForm.setFieldsValue({
      nftAddress: nft.nftAddress,
    });
    Modal.confirm({
      title: `Transfer ${nft.name}`,
      content: (
        <Form form={transferForm} layout="vertical" style={{ marginTop: '20px' }}>
          <Form.Item
            name="nftAddress"
            label="NFT Address"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="newOwnerAddress"
            label="New Owner Address"
            rules={[{ required: true, message: 'Please enter new owner address' }]}
          >
            <Input placeholder="Enter new owner's wallet address" />
          </Form.Item>
        </Form>
      ),
      onOk: () => {
        return transferForm.validateFields()
          .then(values => {
            return handleTransferNFT(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      },
    });
  };

  const preUpdateNFT = (nft: NFT) => {
    updateForm.setFieldsValue({
      nftAddress: nft.nftAddress,
      name: nft.name,
      symbol: nft.symbol,
      uri: nft.uri,
    });
    Modal.confirm({
      title: `Update ${nft.name} Metadata`,
      content: (
        <Form form={updateForm} layout="vertical" style={{ marginTop: '20px' }}>
          <Form.Item
            name="nftAddress"
            label="NFT Address"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="symbol"
            label="Symbol"
            rules={[{ required: true, message: 'Please enter symbol' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="uri"
            label="Metadata URI"
            rules={[{ required: true, message: 'Please enter metadata URI' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      ),
      width: 600,
      onOk: () => {
        return updateForm.validateFields()
          .then(values => {
            return handleUpdateNFT(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      },
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>Loading NFT data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ maxWidth: '800px', margin: '50px auto' }}
      />
    );
  }

  return (
    <div className="nft-management">
      <Title level={2}>NFT Management</Title>
      
      <Tabs defaultActiveKey="nfts">
        <TabPane tab="Your NFTs" key="nfts">
          <Card title="NFT Collection" style={{ marginBottom: '24px' }}>
            <Table
              dataSource={nfts}
              columns={columns}
              rowKey="nftAddress"
            />
          </Card>
        </TabPane>
        
        <TabPane tab="Create NFT" key="create">
          <Card title="Create New NFT">
            <Form
              form={createForm}
              layout="vertical"
              onFinish={handleCreateNFT}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="NFT Name"
                    rules={[{ required: true, message: 'Please enter NFT name' }]}
                  >
                    <Input placeholder="e.g., My Awesome NFT" />
                  </Form.Item>
                  
                  <Form.Item
                    name="symbol"
                    label="Symbol"
                    rules={[{ required: true, message: 'Please enter symbol' }]}
                  >
                    <Input placeholder="e.g., MNFT" />
                  </Form.Item>
                  
                  <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                  >
                    <TextArea 
                      rows={4}
                      placeholder="Describe your NFT"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="royaltyPercentage"
                    label="Royalty Percentage"
                    initialValue={0}
                    rules={[{ required: true, message: 'Please enter royalty percentage' }]}
                  >
                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                  
                  <Form.Item
                    name="isMutable"
                    label="Mutable"
                    initialValue={true}
                    valuePropName="checked"
                    tooltip="If enabled, you can update this NFT's metadata later"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    label="NFT Image"
                    rules={[{ required: true, message: 'Please upload an image' }]}
                  >
                    <Upload
                      name="image"
                      listType="picture-card"
                      fileList={fileList}
                      onPreview={handlePreview}
                      onChange={handleChange}
                      customRequest={async ({ file, onSuccess, onError }) => {
                        try {
                          const imageUrl = await handleUploadImage(file as File);
                          if (imageUrl && onSuccess) {
                            onSuccess({ imageUrl });
                          } else if (onError) {
                            onError(new Error('Upload failed'));
                          }
                        } catch (err) {
                          if (onError) onError(err as Error);
                        }
                      }}
                      beforeUpload={(file) => {
                        const isImage = file.type.startsWith('image/');
                        if (!isImage) {
                          message.error('You can only upload image files!');
                        }
                        const isLt5M = file.size / 1024 / 1024 < 5;
                        if (!isLt5M) {
                          message.error('Image must be smaller than 5MB!');
                        }
                        return isImage && isLt5M;
                      }}
                    >
                      {fileList.length >= 1 ? null : uploadButton}
                    </Upload>
                    <Modal
                      open={previewOpen}
                      title={previewTitle}
                      footer={null}
                      onCancel={handleCancel}
                    >
                      <img style={{ width: '100%' }} src={previewImage} alt="Preview" />
                    </Modal>
                  </Form.Item>
                  
                  <Card title="Attributes" size="small" style={{ marginBottom: '16px' }}>
                    {attributes.map((attr, index) => (
                      <div key={index} style={{ display: 'flex', marginBottom: '8px' }}>
                        <Input
                          placeholder="Trait type"
                          value={attr.trait_type}
                          onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                          style={{ marginRight: '8px' }}
                        />
                        <Input
                          placeholder="Value"
                          value={attr.value}
                          onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                          style={{ marginRight: '8px' }}
                        />
                        <Button 
                          type="text" 
                          danger 
                          onClick={() => removeAttribute(index)}
                          icon={<PlusOutlined style={{ transform: 'rotate(45deg)' }} />}
                        />
                      </div>
                    ))}
                    <Button 
                      type="dashed" 
                      onClick={addAttribute} 
                      block 
                      icon={<PlusOutlined />}
                    >
                      Add Attribute
                    </Button>
                  </Card>
                </Col>
              </Row>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  icon={<PlusOutlined />}
                  disabled={!imageUrl}
                >
                  Create NFT
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default NFTManagement; 