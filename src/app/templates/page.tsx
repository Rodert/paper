import Link from 'next/link';
import { CSSProperties } from 'react';

// 定义所有可用的模板类型
const TEMPLATES = [
  {
    id: 'ruled',
    name: '标准笔记本',
    description: '适合日常笔记记录用的横线纸模板',
    spacing: '6mm',
    thickness: '0.5px',
    bgClass: 'bg-blue-50',
    style: {
      backgroundImage: 'repeating-linear-gradient(0deg, #e0e7ff, #e0e7ff 1px, transparent 1px, transparent 8mm)'
    } as CSSProperties
  },
  {
    id: 'grid',
    name: '数学草稿纸',
    description: '适合数学计算记录的格纸模板',
    spacing: '5mm',
    thickness: '0.3px',
    bgClass: 'bg-blue-50',
    style: {
      backgroundImage: 'linear-gradient(#e0e7ff 0.3px, transparent 0.3px), linear-gradient(90deg, #e0e7ff 0.3px, transparent 0.3px)',
      backgroundSize: '5mm 5mm'
    } as CSSProperties
  },
  {
    id: 'dot',
    name: '点阵纸',
    description: '适合绘制图形和规划的点阵纸',
    spacing: '5mm',
    thickness: '0.3px',
    bgClass: 'bg-blue-50',
    style: {
      backgroundImage: 'radial-gradient(circle, #a5b4fc 1px, rgba(0, 0, 0, 0) 1px)',
      backgroundSize: '5mm 5mm'
    } as CSSProperties
  },
  {
    id: 'blank',
    name: '空白纸',
    description: '纯白纸张，适合自由创作',
    spacing: '无',
    thickness: '0px',
    bgClass: 'bg-white',
    style: {} as CSSProperties
  },
  {
    id: 'music',
    name: '乐谱纸',
    description: '适合音乐创作和记谱',
    spacing: '7mm',
    thickness: '0.5px',
    bgClass: 'bg-blue-50',
    style: {
      backgroundImage: 'repeating-linear-gradient(0deg, #a5b4fc, #a5b4fc 0.5px, transparent 0.5px, transparent 7mm)',
      position: 'relative' as 'relative'
    } as CSSProperties
  },
  {
    id: 'cornell',
    name: '康奈尔笔记法',
    description: '适合学习记录和整理知识',
    spacing: '7mm',
    thickness: '0.6px',
    bgClass: 'bg-blue-50',
    style: {} as CSSProperties
  },
  {
    id: 'hexagon',
    name: '六边形网格纸',
    description: '适合游戏设计和科学项目',
    spacing: '15mm',
    thickness: '0.3px',
    bgClass: 'bg-blue-50',
    style: {} as CSSProperties
  },
  {
    id: 'isometric',
    name: '等距网格纸',
    description: '适合3D设计和规划项目',
    spacing: '10mm',
    thickness: '0.3px',
    bgClass: 'bg-blue-50',
    style: {} as CSSProperties
  },
  {
    id: 'chinese',
    name: '复古笔记本',
    description: '怀旧风格的传统中式纸张',
    spacing: '8mm',
    thickness: '0.6px',
    bgClass: 'bg-amber-50',
    style: {} as CSSProperties
  },
  {
    id: 'todo',
    name: '待办事项清单',
    description: '适合项目管理和任务规划',
    spacing: '8mm',
    thickness: '0.5px',
    bgClass: 'bg-blue-50',
    style: {} as CSSProperties
  },
  {
    id: 'storyboard',
    name: '故事板',
    description: '适合视频创作和动画设计',
    spacing: '无',
    thickness: '0.5px',
    bgClass: 'bg-white',
    style: {} as CSSProperties
  }
];

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h1 className="text-xl font-bold text-gray-800">纸张模板库</h1>
            </Link>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li><Link href="/" className="text-gray-600 hover:text-indigo-600">首页</Link></li>
              <li><Link href="/#templates" className="text-gray-600 hover:text-indigo-600">模板</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">所有模板</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template) => (
            <div key={template.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className={`h-40 ${template.bgClass} flex items-center justify-center p-4`}>
                <div className="w-full h-full" style={template.style}>
                  {template.id === 'blank' && (
                    <div className="text-gray-300 text-xl flex items-center justify-center h-full">空白纸</div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-800">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span className="flex items-center mr-3">
                    <span className="mr-1">线条间距:</span>
                    <span className="font-medium">{template.spacing}</span>
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">线条粗细:</span>
                    <span className="font-medium">{template.thickness}</span>
                  </span>
                </div>
                <div className="mt-4">
                  <Link 
                    href={`/templates/${template.id}`} 
                    className="inline-block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    选择此模板
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white py-8 border-t mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">&copy; 2024 纸张模板库. 保留所有权利。</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 