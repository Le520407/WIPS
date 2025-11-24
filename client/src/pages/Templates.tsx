import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { templateService } from '../services/api';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    language: 'zh_CN',
    category: 'MARKETING',
    body: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    templateService.getTemplates()
      .then((data: any) => setTemplates(data.templates))
      .catch((err: any) => console.error(err));
  };

  const handleCreateTemplate = async () => {
    try {
      await templateService.createTemplate({
        name: newTemplate.name,
        language: newTemplate.language,
        category: newTemplate.category,
        components: [
          {
            type: 'BODY',
            text: newTemplate.body
          }
        ]
      });
      setShowModal(false);
      setNewTemplate({ name: '', language: 'zh_CN', category: 'MARKETING', body: '' });
      loadTemplates();
      alert('模板创建成功！');
    } catch (error) {
      alert('创建失败');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">消息模板</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          创建模板
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">暂无模板</p>
        ) : (
          templates.map((template: any) => (
            <div key={template.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                  <span className="text-sm text-gray-500">{template.language}</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  template.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {template.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{template.category}</p>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 border rounded hover:bg-gray-50">
                  <Edit className="w-4 h-4 mx-auto" />
                </button>
                <button className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">创建新模板</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="模板名称"
                value={newTemplate.name}
                onChange={(e: any) => setNewTemplate({...newTemplate, name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={newTemplate.language}
                onChange={(e: any) => setNewTemplate({...newTemplate, language: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="zh_CN">中文</option>
                <option value="en">English</option>
              </select>
              <select
                value={newTemplate.category}
                onChange={(e: any) => setNewTemplate({...newTemplate, category: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="MARKETING">营销</option>
                <option value="UTILITY">实用</option>
              </select>
              <textarea
                placeholder="模板内容"
                value={newTemplate.body}
                onChange={(e: any) => setNewTemplate({...newTemplate, body: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg h-32"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateTemplate}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
