'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import jsPDF from 'jspdf';

// 定义接口
interface TemplateOptions {
  spacing: number;
  thickness: number;
  color: string;
}

interface PaperSize {
  width: number;
  height: number;
}

interface Template {
  name: string;
  description: string;
  defaultSpacing: number;
  defaultThickness: number;
  defaultColor: string;
  render: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, options: TemplateOptions) => void;
}

type OrientationType = 'portrait' | 'landscape';

// 定义不同纸张的尺寸（以毫米为单位）
const PAPER_SIZES: Record<string, PaperSize> = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  B4: { width: 250, height: 353 },
  B5: { width: 176, height: 250 },
  Legal: { width: 216, height: 356 },
};

// 定义纸张类型的配置
const TEMPLATES: Record<string, Template> = {
  ruled: {
    name: '标准笔记本',
    description: '适合日常笔记记录用的横线纸模板',
    defaultSpacing: 6,
    defaultThickness: 0.5,
    defaultColor: '#a5b4fc',
    render: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, options: TemplateOptions) => {
      const { width, height } = canvas;
      const { spacing, color, thickness } = options;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      
      // 绘制横线
      for (let y = spacing; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    },
  },
  grid: {
    name: '数学草稿纸',
    description: '适合数学计算记录的格纸模板',
    defaultSpacing: 5,
    defaultThickness: 0.3,
    defaultColor: '#a5b4fc',
    render: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, options: TemplateOptions) => {
      const { width, height } = canvas;
      const { spacing, color, thickness } = options;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      
      // 绘制网格
      // 绘制水平线
      for (let y = 0; y <= height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // 绘制垂直线
      for (let x = 0; x <= width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    },
  },
  dot: {
    name: '点阵纸',
    description: '适合绘制图形和规划的点阵纸',
    defaultSpacing: 5,
    defaultThickness: 0.3,
    defaultColor: '#a5b4fc',
    render: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, options: TemplateOptions) => {
      const { width, height } = canvas;
      const { spacing, color, thickness } = options;
      
      ctx.fillStyle = color;
      
      // 绘制点阵
      for (let y = spacing; y < height; y += spacing) {
        for (let x = spacing; x < width; x += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, thickness, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
  },
  blank: {
    name: '空白纸',
    description: '纯白纸张，适合自由创作',
    defaultSpacing: 0,
    defaultThickness: 0,
    defaultColor: '#ffffff',
    render: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, options: TemplateOptions) => {
      // 空白纸不需要绘制任何内容
    },
  },
  music: {
    name: '乐谱纸',
    description: '适合音乐创作和记谱',
    defaultSpacing: 7,
    defaultThickness: 0.5,
    defaultColor: '#a5b4fc',
    render: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, options: TemplateOptions) => {
      const { width, height } = canvas;
      const { spacing, color, thickness } = options;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      
      // 绘制五线谱（以组为单位）
      const staffHeight = spacing * 4; // 五线谱的总高度
      const lineSpacing = staffHeight / 4; // 五线谱内线之间的间距
      
      // 计算可以放置的五线谱组数
      const numStaves = Math.floor(height / (staffHeight + spacing * 2));
      const startY = (height - (numStaves * (staffHeight + spacing * 2) - spacing * 2)) / 2;
      
      for (let i = 0; i < numStaves; i++) {
        const groupY = startY + i * (staffHeight + spacing * 2);
        
        // 绘制五线
        for (let j = 0; j < 5; j++) {
          const lineY = groupY + j * lineSpacing;
          ctx.beginPath();
          ctx.moveTo(0, lineY);
          ctx.lineTo(width, lineY);
          ctx.stroke();
        }
      }
    },
  },
};

export default function TemplatePage() {
  const params = useParams();
  const templateType = params.type as string;
  const template = TEMPLATES[templateType as keyof typeof TEMPLATES] || TEMPLATES.ruled;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paperSizeRef = useRef<HTMLSelectElement>(null);
  
  const [paperSize, setPaperSize] = useState<string>('A4');
  const [spacing, setSpacing] = useState<number>(template.defaultSpacing);
  const [thickness, setThickness] = useState<number>(template.defaultThickness);
  const [color, setColor] = useState<string>(template.defaultColor);
  const [orientation, setOrientation] = useState<OrientationType>('portrait');
  
  // 渲染模板到画布
  const renderTemplate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 获取纸张尺寸
    const size = PAPER_SIZES[paperSize];
    
    // 设置画布大小（按照比例缩放）
    let canvasWidth, canvasHeight;
    if (orientation === 'portrait') {
      canvasWidth = 600;
      canvasHeight = (size.height / size.width) * canvasWidth;
    } else {
      canvasHeight = 600;
      canvasWidth = (size.width / size.height) * canvasHeight;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // 清空画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 转换毫米到像素的比例
    const pixelsPerMm = canvasWidth / (orientation === 'portrait' ? size.width : size.height);
    
    // 绘制模板
    template.render(canvas, ctx, {
      spacing: spacing * pixelsPerMm,
      thickness: thickness,
      color: color,
    });
  };
  
  // 生成并下载PDF
  const generatePDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 获取纸张尺寸
    const size = PAPER_SIZES[paperSize];
    
    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: paperSize as any,
    });
    
    // 将画布转换为图像
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    // 添加图像到PDF
    if (orientation === 'portrait') {
      pdf.addImage(imgData, 'JPEG', 0, 0, size.width, size.height);
    } else {
      pdf.addImage(imgData, 'JPEG', 0, 0, size.height, size.width);
    }
    
    // 下载PDF
    pdf.save(`${template.name}-${paperSize}.pdf`);
  };
  
  // 当参数变化时重新渲染模板
  useEffect(() => {
    renderTemplate();
  }, [templateType, paperSize, spacing, thickness, color, orientation]);
  
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左侧：预览画布 */}
          <div className="md:w-2/3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{template.name} 预览</h2>
              <div className="overflow-auto">
                <canvas 
                  ref={canvasRef} 
                  className="border border-gray-200 mx-auto shadow-sm"
                ></canvas>
              </div>
            </div>
          </div>
          
          {/* 右侧：控制面板 */}
          <div className="md:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">定制选项</h2>
              
              <div className="space-y-6">
                {/* 纸张尺寸选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">纸张尺寸</label>
                  <select
                    ref={paperSizeRef}
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="A5">A5 (148 × 210 mm)</option>
                    <option value="B4">B4 (250 × 353 mm)</option>
                    <option value="B5">B5 (176 × 250 mm)</option>
                    <option value="Legal">Legal (216 × 356 mm)</option>
                  </select>
                </div>
                
                {/* 纸张方向 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">纸张方向</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="portrait"
                        checked={orientation === 'portrait'}
                        onChange={() => setOrientation('portrait')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">纵向</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="landscape"
                        checked={orientation === 'landscape'}
                        onChange={() => setOrientation('landscape')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">横向</span>
                    </label>
                  </div>
                </div>
                
                {/* 线条间距 */}
                {templateType !== 'blank' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      线条间距 ({spacing} mm)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={spacing}
                      onChange={(e) => setSpacing(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
                
                {/* 线条粗细 */}
                {templateType !== 'blank' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      线条粗细 ({thickness} px)
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={thickness}
                      onChange={(e) => setThickness(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
                
                {/* 线条颜色 */}
                {templateType !== 'blank' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">线条颜色</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-8 w-8 p-0 border-0"
                      />
                      <span className="text-gray-600">{color}</span>
                    </div>
                  </div>
                )}
                
                {/* 导出按钮 */}
                <div className="pt-4">
                  <button
                    onClick={generatePDF}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    生成PDF文件
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 