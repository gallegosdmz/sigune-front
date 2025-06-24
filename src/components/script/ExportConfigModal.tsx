import React, { useState } from 'react';
import { Modal, Checkbox, Button, Space, Divider, Typography, Card } from 'antd';
import { Content } from '../../interfaces/Content';

const { Title, Text } = Typography;

interface ExportConfigModalProps {
  visible: boolean;
  onCancel: () => void;
  onExport: (config: ExportConfig) => void;
  contents: Content[];
}

export interface ExportConfig {
  [contentId: number]: {
    title: boolean;
    head: boolean;
    textContent: boolean;
  };
}

const ExportConfigModal: React.FC<ExportConfigModalProps> = ({
  visible,
  onCancel,
  onExport,
  contents,
}) => {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({});

  // Inicializar configuración por defecto cuando se abre el modal
  React.useEffect(() => {
    if (visible) {
      const defaultConfig: ExportConfig = {};
      contents.forEach((content) => {
        defaultConfig[content.id!] = {
          title: true,
          head: true,
          textContent: true,
        };
      });
      setExportConfig(defaultConfig);
    }
  }, [visible, contents]);

  const handleFieldChange = (contentId: number, field: 'title' | 'head' | 'textContent', checked: boolean) => {
    setExportConfig(prev => ({
      ...prev,
      [contentId]: {
        ...prev[contentId],
        [field]: checked,
      },
    }));
  };

  const handleSelectAll = (field: 'title' | 'head' | 'textContent', checked: boolean) => {
    const newConfig: ExportConfig = {};
    contents.forEach((content) => {
      newConfig[content.id!] = {
        ...exportConfig[content.id!],
        [field]: checked,
      };
    });
    setExportConfig(newConfig);
  };

  const handleSelectAllContents = (checked: boolean) => {
    const newConfig: ExportConfig = {};
    contents.forEach((content) => {
      newConfig[content.id!] = {
        title: checked,
        head: checked,
        textContent: checked,
      };
    });
    setExportConfig(newConfig);
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'title':
        return 'Título';
      case 'head':
        return 'Cabeza';
      case 'textContent':
        return 'Contenido';
      default:
        return field;
    }
  };

  const stripHtml = (html: string): string => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleExport = () => {
    onExport(exportConfig);
  };

  return (
    <Modal
      title="Configurar Exportación a Word"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button key="export" type="primary" onClick={handleExport}>
          Exportar
        </Button>,
      ]}
      width={800}
      centered
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>Selecciona qué campos incluir para cada contenido:</Title>
        
        {/* Controles globales */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Controles globales:</Text>
            <Space>
              <Checkbox
                checked={contents.every(content => 
                  exportConfig[content.id!]?.title && 
                  exportConfig[content.id!]?.head && 
                  exportConfig[content.id!]?.textContent
                )}
                indeterminate={contents.some(content => 
                  exportConfig[content.id!]?.title || 
                  exportConfig[content.id!]?.head || 
                  exportConfig[content.id!]?.textContent
                ) && !contents.every(content => 
                  exportConfig[content.id!]?.title && 
                  exportConfig[content.id!]?.head && 
                  exportConfig[content.id!]?.textContent
                )}
                onChange={(e) => handleSelectAllContents(e.target.checked)}
              >
                Seleccionar todos los campos
              </Checkbox>
            </Space>
            
            <Space>
              <Checkbox
                checked={contents.every(content => exportConfig[content.id!]?.title)}
                indeterminate={contents.some(content => exportConfig[content.id!]?.title) && !contents.every(content => exportConfig[content.id!]?.title)}
                onChange={(e) => handleSelectAll('title', e.target.checked)}
              >
                Todos los títulos
              </Checkbox>
              <Checkbox
                checked={contents.every(content => exportConfig[content.id!]?.head)}
                indeterminate={contents.some(content => exportConfig[content.id!]?.head) && !contents.every(content => exportConfig[content.id!]?.head)}
                onChange={(e) => handleSelectAll('head', e.target.checked)}
              >
                Todas las cabezas
              </Checkbox>
              <Checkbox
                checked={contents.every(content => exportConfig[content.id!]?.textContent)}
                indeterminate={contents.some(content => exportConfig[content.id!]?.textContent) && !contents.every(content => exportConfig[content.id!]?.textContent)}
                onChange={(e) => handleSelectAll('textContent', e.target.checked)}
              >
                Todos los contenidos
              </Checkbox>
            </Space>
          </Space>
        </Card>

        <Divider />

        {/* Configuración individual por contenido */}
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {contents.map((content, index) => (
            <Card 
              key={content.id} 
              size="small" 
              style={{ marginBottom: 8 }}
              title={`${index + 1}. ${content.type} - ${content.title}`}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Checkbox
                  checked={exportConfig[content.id!]?.title || false}
                  onChange={(e) => handleFieldChange(content.id!, 'title', e.target.checked)}
                >
                  <Text strong>{getFieldLabel('title')}:</Text> {content.title}
                </Checkbox>
                
                <Checkbox
                  checked={exportConfig[content.id!]?.head || false}
                  onChange={(e) => handleFieldChange(content.id!, 'head', e.target.checked)}
                >
                  <Text strong>{getFieldLabel('head')}:</Text> {stripHtml(content.head).substring(0, 100)}...
                </Checkbox>
                
                <Checkbox
                  checked={exportConfig[content.id!]?.textContent || false}
                  onChange={(e) => handleFieldChange(content.id!, 'textContent', e.target.checked)}
                >
                  <Text strong>{getFieldLabel('textContent')}:</Text> {stripHtml(content.textContent).substring(0, 100)}...
                </Checkbox>
              </Space>
            </Card>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ExportConfigModal; 