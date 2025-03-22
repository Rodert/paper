'use client';

import Link from "next/link";
import { useState, useEffect, CSSProperties } from "react";
import React from "react";
import clsx from 'clsx';
import html2canvas from 'html2canvas';

export default function Home() {
  // 定义状态变量
  const [paperType, setPaperType] = useState('横线纸');
  const [paperSize, setPaperSize] = useState('A4 (210 × 297 mm)');
  const [theme, setTheme] = useState('默认主题');
  const [lineColor, setLineColor] = useState('#6b7280');
  const [lineStyle, setLineStyle] = useState('连续');
  const [lineSpacing, setLineSpacing] = useState(8);
  const [lineThickness, setLineThickness] = useState(0.5);
  const [margins, setMargins] = useState({
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  });
  const [bgColor, setBgColor] = useState('bg-white');
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);

  // 定义主题配置类型
  type ThemeType = '默认主题' | '浅色主题' | '护眼主题' | '复古主题' | '海洋风';
  
  type ThemeConfigType = {
    [key in ThemeType]: {
      lineColor: string;
      bgColor: string;
    }
  };

  // 主题配置
  const themeConfig: ThemeConfigType = {
    '默认主题': {
      lineColor: '#6b7280',
      bgColor: 'bg-white'
    },
    '浅色主题': {
      lineColor: '#94a3b8',
      bgColor: 'bg-gray-100'
    },
    '护眼主题': {
      lineColor: '#84cc16',
      bgColor: 'bg-green-50'
    },
    '复古主题': {
      lineColor: '#b45309',
      bgColor: 'bg-yellow-50'
    },
    '海洋风': {
      lineColor: '#38bdf8',
      bgColor: 'bg-blue-50'
    }
  };

  // 应用主题效果
  useEffect(() => {
    const selectedTheme = theme as ThemeType;
    if (themeConfig[selectedTheme]) {
      setLineColor(themeConfig[selectedTheme].lineColor);
      setBgColor(themeConfig[selectedTheme].bgColor);
    }
  }, [theme]);

  // 处理背景颜色按钮点击
  const handleBgColorClick = (color: string): void => {
    setBgColor(color);
  };

  // 处理边距变化
  const handleMarginChange = (side: string, value: string): void => {
    setMargins({
      ...margins,
      [side]: parseInt(value)
    });
  };

  // 计算当前纸张尺寸的宽高比 - 使用useMemo缓存结果
  const paperDimensions = React.useMemo(() => {
    // 从paperSize字符串中提取尺寸信息
    const dimensionsMatch = paperSize.match(/\((\d+)\s*×\s*(\d+)/);
    if (dimensionsMatch) {
      const width = parseInt(dimensionsMatch[1], 10);
      const height = parseInt(dimensionsMatch[2], 10);
      
      // 确定一个固定的毫米到像素的转换比例
      // 这个比例应该与实际打印时的物理大小匹配
      const scale = 2.5;  
      
      // 调整最大宽度限制，确保大幅面纸张也能显示得更大
      const maxPreviewWidth = 800;
      const maxPreviewHeight = 1000;
      
      // 计算预览尺寸，使用固定的缩放比例
      const previewWidth = Math.min(maxPreviewWidth, width * scale);
      const previewHeight = Math.min(maxPreviewHeight, height * scale);
      
      // 计算实际使用的比例尺 (像素/毫米)
      const actualScaleX = previewWidth / width;
      const actualScaleY = previewHeight / height;
      
      return { 
        width,         // 宽度，单位mm
        height,        // 高度，单位mm
        ratio: height / width, // 高宽比
        scale,         // 理想比例尺
        actualScaleX,  // 实际X轴比例尺 (像素/毫米)
        actualScaleY,  // 实际Y轴比例尺 (像素/毫米)
        previewWidth,  // 预览宽度 (像素)
        previewHeight  // 预览高度 (像素)
      };
    }
    // 默认返回A4比例
    const defaultWidth = 210;
    const defaultHeight = 297;
    const scale = 2.5;
    const previewWidth = Math.min(800, defaultWidth * scale);
    const previewHeight = Math.min(1000, defaultHeight * scale);
    
    return { 
      width: defaultWidth, 
      height: defaultHeight, 
      ratio: defaultHeight / defaultWidth,
      scale,
      actualScaleX: previewWidth / defaultWidth,
      actualScaleY: previewHeight / defaultHeight,
      previewWidth,
      previewHeight
    };
  }, [paperSize]);
  
  // 替换之前的getPaperDimensions函数
  const getPaperDimensions = () => paperDimensions;

  // 生成背景样式 - 使用useMemo确保一致性
  const backgroundStyle = React.useMemo(() => {
    // 转换Tailwind类名为实际CSS颜色
    const bgColorMap: Record<string, string> = {
      'bg-white': '#ffffff',
      'bg-blue-50': '#eff6ff',
      'bg-yellow-50': '#fefce8',
      'bg-green-50': '#f0fdf4',
      'bg-pink-50': '#fdf2f8',
      'bg-gray-100': '#f3f4f6'
    };

    // 获取实际的背景色
    const backgroundColor = bgColorMap[bgColor] || '#ffffff';

    let backgroundImage = 'none';
    let backgroundSize = 'auto';
    let backgroundPosition = '0 0';
    
    // 更细腻的线条样式
    const lineOpacity = 0.7; // 让线条更透明一些
    const lineColorWithOpacity = lineColor === '#38bdf8' 
      ? 'rgba(56, 189, 248, 0.7)' // 海洋风主题使用半透明的蓝色
      : `${lineColor}${Math.round(lineOpacity * 255).toString(16).padStart(2, '0')}`;
    
    // 计算线条间距占纸张宽度的百分比
    const lineSpacingPercent = (lineSpacing / paperDimensions.width) * 100;
    
    // 计算线条粗细，确保在不同尺寸纸张上保持一致的视觉粗细
    // 但设置最小值确保线条始终可见
    const relativeThickness = Math.max(
      0.8, // 最小粗细，确保在大缩放下仍然精细
      (lineThickness / paperDimensions.width) * paperDimensions.previewWidth
    );
    
    // 计算每个方格的实际像素尺寸
    // 使用固定比例尺确保方格为正方形
    // 格子大小 = 线条间距(mm) * 实际比例尺(像素/毫米)
    const gridSizeInPixels = lineSpacing * Math.min(paperDimensions.actualScaleX, paperDimensions.actualScaleY);
    
    // 预先计算方格纸所需的垂直和水平线条数量
    const verticalLinesCount = Math.floor(paperDimensions.previewWidth / gridSizeInPixels) + 3;
    const horizontalLinesCount = Math.floor(paperDimensions.previewHeight / gridSizeInPixels) + 3;
    
    // 生成垂直线数组（仅当需要时）
    const verticalLines = paperType === '方格纸' && lineStyle !== '实线' 
      ? Array.from({ length: verticalLinesCount }).map((_, i) => ({
          position: i * gridSizeInPixels,
          key: `v-${i}`
        })) 
      : [];
    
    // 生成水平线数组（对于需要的纸张类型）
    const horizontalLines = (paperType === '横线纸' || paperType === '方格纸' || paperType === '乐谱纸') && lineStyle !== '实线'
      ? (() => {
          if (paperType === '方格纸') {
            return Array.from({ length: horizontalLinesCount }).map((_, i) => ({
              position: i * gridSizeInPixels,
              key: `h-${i}`
            }));
          } else if (paperType === '乐谱纸') {
            const musicLineSpacing = lineSpacing * Math.min(paperDimensions.actualScaleX, paperDimensions.actualScaleY);
            const halfSpacing = musicLineSpacing / 2;
            const staffGroups = Math.ceil(paperDimensions.previewHeight / musicLineSpacing) + 1;
            
            return Array.from({ length: staffGroups * 2 }).map((_, i) => {
              const isMainLine = i % 2 === 0;
              const groupIndex = Math.floor(i / 2);
              return {
                position: groupIndex * musicLineSpacing + (isMainLine ? 0 : halfSpacing),
                key: `m-${i}`
              };
            });
          } else {
            const lineSpacingPx = lineSpacing * Math.min(paperDimensions.actualScaleX, paperDimensions.actualScaleY);
            const lineCount = Math.ceil(paperDimensions.previewHeight / lineSpacingPx) + 1;
            
            return Array.from({ length: lineCount }).map((_, i) => ({
              position: i * lineSpacingPx,
              key: `h-${i}`
            }));
          }
        })()
      : [];
    
    // 处理不同的线条样式
    let borderStyle = 'solid';  // 默认为实线
    let dashWidth = 0;
    let dashGap = 0;
    
    if (lineStyle === '虚线') {
      borderStyle = 'dashed';
      // 调整虚线的宽度和间距以适应不同的间距设置
      dashWidth = Math.max(5, lineSpacingPercent / 10);
      dashGap = Math.max(3, lineSpacingPercent / 20);
    } else if (lineStyle === '点线') {
      borderStyle = 'dotted';
      dashWidth = 1;
      dashGap = Math.max(3, lineSpacingPercent / 15);
    }
    
    switch(paperType) {
      case '横线纸':
        if (lineStyle === '实线') {
          backgroundImage = `repeating-linear-gradient(
            0deg, 
            ${lineColorWithOpacity}, 
            ${lineColorWithOpacity} ${relativeThickness}px, 
            transparent ${relativeThickness}px, 
            transparent ${lineSpacingPercent}%
          )`;
        } else {
          // 使用border-style属性处理虚线和点线
          backgroundImage = 'none'; // 清除默认的背景图像
        }
        break;
      case '方格纸':
        if (lineStyle === '实线') {
          // 使用像素单位定义网格，确保方格为正方形
          const cellSize = gridSizeInPixels; // 每个单元格的像素大小
          
          // 确保最右侧和最下方的网格线能够完全覆盖到边缘
          backgroundImage = `
            linear-gradient(${lineColorWithOpacity} ${relativeThickness}px, transparent ${relativeThickness}px, transparent ${cellSize - relativeThickness}px, ${lineColorWithOpacity} ${cellSize - relativeThickness}px, ${lineColorWithOpacity} ${cellSize}px, transparent ${cellSize}px),
            linear-gradient(90deg, ${lineColorWithOpacity} ${relativeThickness}px, transparent ${relativeThickness}px, transparent ${cellSize - relativeThickness}px, ${lineColorWithOpacity} ${cellSize - relativeThickness}px, ${lineColorWithOpacity} ${cellSize}px, transparent ${cellSize}px)
          `;
          
          // 设置背景尺寸为固定像素值，并通过设置100%+1px的技巧确保覆盖边缘
          backgroundSize = `${cellSize}px ${cellSize}px`;
          backgroundPosition = '0 0';
        } else {
          // 清除默认的背景图像
          backgroundImage = 'none';
        }
        break;
      case '点阵纸':
        // 点阵纸的样式不受线条样式影响，保持不变
        backgroundImage = `radial-gradient(
          circle,
          ${lineColorWithOpacity} ${relativeThickness}px,
          transparent ${relativeThickness}px
        )`;
        // 使用像素单位确保点阵为正方形网格
        // 使用相同的计算方法确保点阵也是正方形
        const dotGridSize = lineSpacing * Math.min(paperDimensions.actualScaleX, paperDimensions.actualScaleY);
        backgroundSize = `${dotGridSize}px ${dotGridSize}px`;
        backgroundPosition = '0 0';
        break;
      case '乐谱纸':
        if (lineStyle === '实线') {
          // 使用像素值而非百分比来确保音乐间距一致
          const musicLineSpacing = lineSpacing * Math.min(paperDimensions.actualScaleX, paperDimensions.actualScaleY);
          const halfSpacing = musicLineSpacing / 2;
          
          backgroundImage = `repeating-linear-gradient(
            0deg,
            ${lineColorWithOpacity},
            ${lineColorWithOpacity} ${relativeThickness}px,
            transparent ${relativeThickness}px,
            transparent ${halfSpacing - relativeThickness}px,
            ${lineColorWithOpacity} ${halfSpacing - relativeThickness}px,
            ${lineColorWithOpacity} ${halfSpacing}px,
            transparent ${halfSpacing}px,
            transparent ${musicLineSpacing}px
          )`;
          
          backgroundSize = `auto ${musicLineSpacing}px`;
          backgroundPosition = '0 0';
        } else {
          // 使用border-style属性处理虚线和点线
          backgroundImage = 'none'; // 清除默认的背景图像
        }
        break;
      case '空白纸':
      default:
        backgroundImage = 'none';
        break;
    }

    return {
      backgroundImage,
      backgroundSize,
      backgroundColor,
      backgroundPosition,
      borderStyle,
      dashWidth,
      dashGap,
      lineColorWithOpacity,
      lineSpacingPercent,
      relativeThickness,
      gridSizeInPixels,
      verticalLines,
      horizontalLines,
      // 边缘样式计算
      hasRightBorder: paperType === '方格纸' && lineStyle === '实线',
      hasBottomBorder: paperType === '方格纸' && lineStyle === '实线'
    };
  }, [paperType, lineColor, lineSpacing, lineThickness, bgColor, paperDimensions, lineStyle]);
  
  // 替换之前的generateBackgroundStyle函数
  const generateBackgroundStyle = () => backgroundStyle;

  // 生成背景样式类
  const getBgClass = (): string => {
    return bgColor;
  };

  // 生成并下载图像
  const generateImage = () => {
    // 创建一个临时的canvas元素
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      alert('您的浏览器不支持Canvas，无法导出图像！');
      return;
    }
    
    // 设置canvas的尺寸为预览区域的实际尺寸
    canvas.width = paperDimensions.previewWidth;
    canvas.height = paperDimensions.previewHeight;
    
    // 填充背景颜色
    ctx.fillStyle = backgroundStyle.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 获取预览区域的DOM元素
    const previewPaper = document.getElementById('preview-paper');
    if (!previewPaper) {
      alert('无法获取预览内容，请重试！');
      return;
    }
    
    // 使用html2canvas库渲染DOM内容（最理想的方式）
    // 但为了简单起见，我们使用简化的方法
    
    // 绘制边距区域
    const marginTop = (margins.top / paperDimensions.height) * canvas.height;
    const marginLeft = (margins.left / paperDimensions.width) * canvas.width;
    const marginRight = (margins.right / paperDimensions.width) * canvas.width;
    const marginBottom = (margins.bottom / paperDimensions.height) * canvas.height;
    
    const contentWidth = canvas.width - marginLeft - marginRight;
    const contentHeight = canvas.height - marginTop - marginBottom;
    
    // 绘制内容区域（这里我们只是复制样式，完整实现需要更多代码）
    if (backgroundStyle.backgroundImage !== 'none') {
      // 这个部分需要根据backgroundStyle中的信息进行自定义绘制
      // 为了简单起见，我们先直接使用现有预览
      
      // 创建一个临时的div元素来复制样式
      const tempDiv = document.createElement('div');
      tempDiv.style.width = `${contentWidth}px`;
      tempDiv.style.height = `${contentHeight}px`;
      tempDiv.style.backgroundColor = backgroundStyle.backgroundColor;
      tempDiv.style.backgroundImage = backgroundStyle.backgroundImage;
      tempDiv.style.backgroundSize = backgroundStyle.backgroundSize;
      tempDiv.style.backgroundPosition = backgroundStyle.backgroundPosition;
      
      // 由于无法直接绘制CSS背景，所以我们使用简单的图像捕获
      // 在实际应用中，您应该使用html2canvas库来准确捕获DOM元素
    }
    
    // 在这个简化版本中，我们直接使用toDataURL捕获当前显示的内容
    try {
      // 导出canvas为PNG图像
      const imageData = canvas.toDataURL('image/png');
      
      // 创建下载链接
      const link = document.createElement('a');
      const timestamp = new Date().getTime();
      link.download = `${paperType}_${paperSize.split('(')[0].trim()}_${timestamp}.png`;
      link.href = imageData;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('导出图像时出错:', error);
      alert('导出图像时出错，请重试！');
    }
  };
  
  // 使用html2canvas库导出图像（更准确的方法）
  const exportAsImage = () => {
    // 获取预览区域DOM元素
    const previewPaper = document.getElementById('preview-paper');
    
    if (!previewPaper) {
      alert('无法获取预览内容，请重试！');
      return;
    }
    
    // 显示加载状态
    const loadingText = document.createElement('div');
    loadingText.innerText = '正在导出图像...';
    loadingText.style.position = 'absolute';
    loadingText.style.top = '50%';
    loadingText.style.left = '50%';
    loadingText.style.transform = 'translate(-50%, -50%)';
    loadingText.style.padding = '10px 20px';
    loadingText.style.backgroundColor = 'rgba(0,0,0,0.7)';
    loadingText.style.color = 'white';
    loadingText.style.borderRadius = '5px';
    loadingText.style.zIndex = '1000';
    document.body.appendChild(loadingText);
    
    // 使用html2canvas库捕获预览区域
    html2canvas(previewPaper, {
      backgroundColor: backgroundStyle.backgroundColor,
      scale: 2, // 提高导出质量
      useCORS: true,
      allowTaint: true,
      logging: false
    }).then(canvas => {
      try {
        // 导出为图像
        const imageData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const timestamp = new Date().toLocaleString()
          .replace(/[\/\s:,]/g, '-')
          .replace(/\./g, '');
        
        link.download = `${paperType}_${paperSize.split('(')[0].trim()}_${timestamp}.png`;
        link.href = imageData;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('导出图像时出错:', error);
        alert('导出图像时出错，请重试！');
      } finally {
        // 移除加载提示
        document.body.removeChild(loadingText);
      }
    }).catch(error => {
      console.error('生成图像时出错:', error);
      alert('生成图像时出错，请重试！');
      document.body.removeChild(loadingText);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 头部导航 - 更新为蓝紫色 */}
      <header className="bg-indigo-600 text-white shadow-sm">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="text-xl font-bold text-white">纸由我 PaperMe</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <Link href="/templates" className="text-white hover:text-gray-200">模板库</Link>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <Link href="/use" className="text-white hover:text-gray-200">使用指南</Link>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <Link href="/about" className="text-white hover:text-gray-200">关于我们</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="flex flex-1">
        {/* 左侧设置面板 - 调整为更接近截图的样式 */}
        <div className="w-1/4 bg-blue-50/20 p-4">
          <div className="mb-5">
            <div className="mb-1">
              <h2 className="font-medium text-gray-800">纸张类型</h2>
            </div>
            <div>
              <select 
                className="w-full border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-sm"
                value={paperType}
                onChange={(e) => {
                  setPaperType(e.target.value);
                }}
              >
                <option>横线纸</option>
                <option>方格纸</option>
                <option>点阵纸</option>
                <option>空白纸</option>
                <option>乐谱纸</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
              <h2 className="font-medium text-indigo-500">纸张尺寸</h2>
            </div>
            <div>
              <div className="mb-1 text-gray-600 text-sm">纸张尺寸</div>
              <select 
                className="w-full border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-sm"
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
              >
                <option>A4 (210 × 297 mm)</option>
                <option>A5 (148 × 210 mm)</option>
                <option>B4 (250 × 353 mm)</option>
                <option>B5 (176 × 250 mm)</option>
                <option>Legal (216 × 356 mm)</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 text-pink-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
              </svg>
              <h2 className="font-medium text-pink-500">主题</h2>
            </div>
            <div>
              <div className="mb-1 text-gray-600 text-sm">主题</div>
              <select 
                className="w-full border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white text-sm"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option>默认主题</option>
                <option>浅色主题</option>
                <option>护眼主题</option>
                <option>复古主题</option>
                <option>海洋风</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.828 5.586a2 2 0 10-2.828 0l-7 7A2 2 0 002.586 14l-.172 3.172a.5.5 0 00.546.547L6.132 17.5a2 2 0 001.414-.586l7-7a2 2 0 000-2.828l-1.718-1.8zM5 16l-1 1 1-4 4 3-3.5.5z" clipRule="evenodd" />
              </svg>
              <h2 className="font-medium text-purple-500">线条设置</h2>
            </div>
            <div className="space-y-2">
              <div>
                <div className="mb-1 text-gray-600 text-sm">线条颜色</div>
                <div 
                  className="h-8 rounded w-full cursor-pointer relative overflow-hidden border border-gray-200"
                  style={{backgroundColor: '#7dd3fc'}}
                  onClick={() => {
                    const colorPicker = document.getElementById('lineColorPicker');
                    if (colorPicker) colorPicker.click();
                  }}
                >
                  <input
                    id="lineColorPicker"
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                  <div className="absolute inset-0" style={{backgroundColor: lineColor, opacity: 0.5}}></div>
                </div>
              </div>
              <div>
                <div className="mb-1 text-gray-600 text-sm">线条样式</div>
                <select 
                  className="w-full border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-sm"
                  value={lineStyle}
                  onChange={(e) => setLineStyle(e.target.value)}
                >
                  <option>实线</option>
                  <option>虚线</option>
                  <option>点线</option>
                </select>
              </div>
              <div>
                <div className="mb-1 text-gray-600 text-sm">线条间距 (mm)</div>
                <input
                  type="number"
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                  className="w-full border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-sm"
                  min="1"
                  max="20"
                  step="0.5"
                />
              </div>
              <div>
                <div className="mb-1 text-gray-600 text-sm">线条粗细 (px)</div>
                <input
                  type="number"
                  value={lineThickness}
                  onChange={(e) => setLineThickness(parseFloat(e.target.value))}
                  className="w-full border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-sm"
                  min="0.1"
                  max="2"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5zm5 12a4 4 0 100-8 4 4 0 000 8z" clipRule="evenodd" />
              </svg>
              <h2 className="font-medium text-green-500">边距设置</h2>
            </div>
            <div>
              <div className="mb-1 text-gray-600 text-sm">边距 (mm)</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    value={margins.top}
                    onChange={(e) => handleMarginChange('top', e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white text-sm"
                    min="0"
                    max="50"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={margins.right}
                    onChange={(e) => handleMarginChange('right', e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white text-sm"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <input
                    type="number"
                    value={margins.bottom}
                    onChange={(e) => handleMarginChange('bottom', e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white text-sm"
                    min="0"
                    max="50"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={margins.left}
                    onChange={(e) => handleMarginChange('left', e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white text-sm"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <h2 className="font-medium text-yellow-500">背景设置</h2>
            </div>
            <div className="space-y-2">
              <div>
                <div className="mb-1 text-gray-600 text-sm">背景颜色</div>
                <div className="flex space-x-2">
                  <button 
                    className={`w-6 h-6 bg-white border border-gray-300 rounded-sm ${bgColor === 'bg-white' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleBgColorClick('bg-white')}
                  ></button>
                  <button 
                    className={`w-6 h-6 bg-blue-50 border border-gray-300 rounded-sm ${bgColor === 'bg-blue-50' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleBgColorClick('bg-blue-50')}
                  ></button>
                  <button 
                    className={`w-6 h-6 bg-yellow-50 border border-gray-300 rounded-sm ${bgColor === 'bg-yellow-50' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleBgColorClick('bg-yellow-50')}
                  ></button>
                  <button 
                    className={`w-6 h-6 bg-green-50 border border-gray-300 rounded-sm ${bgColor === 'bg-green-50' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleBgColorClick('bg-green-50')}
                  ></button>
                  <button 
                    className={`w-6 h-6 bg-pink-50 border border-gray-300 rounded-sm ${bgColor === 'bg-pink-50' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleBgColorClick('bg-pink-50')}
                  ></button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
              </svg>
              <h2 className="font-medium text-red-500">水印设置</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="watermarkEnabled"
                  checked={watermarkEnabled}
                  onChange={(e) => setWatermarkEnabled(e.target.checked)}
                  className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="watermarkEnabled" className="text-sm text-gray-600">启用水印</label>
              </div>
              {watermarkEnabled && (
                <div>
                  <div className="mb-1 text-gray-600 text-sm">水印文字</div>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="请输入水印文字"
                    className="w-full border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <button 
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center justify-center"
              onClick={exportAsImage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出图像
            </button>
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="flex-1 bg-blue-50/20 p-6 flex flex-col items-center justify-center">
          {/* 纸张尺寸提示 */}
          <div className="text-sm text-gray-500 mb-3">
            {paperSize} - {paperDimensions.width} × {paperDimensions.height} mm
          </div>
          
          {/* 使用精确比例的纸张预览 */}
          <div 
            id="preview-paper"
            className="shadow-md" 
            style={{
              width: `${paperDimensions.previewWidth}px`,
              height: `${paperDimensions.previewHeight}px`,
              // 确保长宽比例精确匹配
              aspectRatio: `${paperDimensions.width} / ${paperDimensions.height}`,
              backgroundColor: backgroundStyle.backgroundColor // 应用背景颜色到整张纸
            }}
          >
            {/* 纸张内容区域 */}
            <div className="w-full h-full relative overflow-hidden">
              {/* 应用边距的内容区域 */}
              <div 
                className="absolute"
                style={{
                  top: `${(margins.top / paperDimensions.height) * 100}%`,
                  left: `${(margins.left / paperDimensions.width) * 100}%`,
                  right: `${(margins.right / paperDimensions.width) * 100}%`,
                  bottom: `${(margins.bottom / paperDimensions.height) * 100}%`,
                  backgroundImage: backgroundStyle.backgroundImage,
                  backgroundSize: backgroundStyle.backgroundSize,
                  backgroundPosition: backgroundStyle.backgroundPosition,
                  backgroundRepeat: 'repeat',
                  // 对方格纸添加右侧和底部边框，确保整体边缘完整
                  ...(backgroundStyle.hasRightBorder ? {
                    borderRight: `${backgroundStyle.relativeThickness}px ${backgroundStyle.lineColorWithOpacity} solid`,
                    borderBottom: `${backgroundStyle.relativeThickness}px ${backgroundStyle.lineColorWithOpacity} solid`
                  } : {})
                }}
              >
                {/* 对于非实线样式，使用伪元素绘制线条 */}
                {lineStyle !== '实线' && paperType !== '点阵纸' && paperType !== '空白纸' && (
                  <div className="absolute inset-0 w-full h-full">
                    {/* 横线 */}
                    {(paperType === '横线纸' || paperType === '方格纸' || paperType === '乐谱纸') && (
                      <div className="absolute inset-0 flex flex-col">
                        {backgroundStyle.horizontalLines.map((line) => (
                          <div 
                            key={line.key}
                            style={{
                              position: 'absolute',
                              top: `${line.position}px`,
                              left: 0,
                              right: 0,
                              height: `${backgroundStyle.relativeThickness}px`,
                              background: 'transparent',
                              borderTop: `${backgroundStyle.relativeThickness}px ${backgroundStyle.borderStyle} ${backgroundStyle.lineColorWithOpacity}`
                            }}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* 垂直线 - 只对方格纸 */}
                    {paperType === '方格纸' && (
                      <div className="absolute inset-0">
                        {/* 使用预计算的垂直线数据 */}
                        {backgroundStyle.verticalLines.map((line) => (
                          <div 
                            key={line.key}
                            style={{
                              position: 'absolute',
                              left: `${line.position}px`,
                              top: 0,
                              bottom: 0,
                              width: `${backgroundStyle.relativeThickness}px`,
                              background: 'transparent',
                              borderLeft: `${backgroundStyle.relativeThickness}px ${backgroundStyle.borderStyle} ${backgroundStyle.lineColorWithOpacity}`
                            }}
                          />
                        ))}
                        
                        {/* 添加右边缘线 - 确保最右侧有边界 */}
                        <div 
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 0,
                            borderLeft: `${backgroundStyle.relativeThickness}px ${backgroundStyle.borderStyle} ${backgroundStyle.lineColorWithOpacity}`
                          }}
                        />
                        
                        {/* 添加底边缘线 - 确保最底部有边界 */}
                        <div 
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: 0,
                            borderTop: `${backgroundStyle.relativeThickness}px ${backgroundStyle.borderStyle} ${backgroundStyle.lineColorWithOpacity}`
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* 水印 */}
              {watermarkEnabled && watermarkText && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  opacity: 0.12,
                  transform: 'rotate(-30deg)',
                  fontSize: '24px',
                  color: '#666',
                  userSelect: 'none'
                }}>
                  {watermarkText}
                </div>
              )}
            </div>
          </div>
          
          {/* 比例指示 - 显示精确的计算比例 */}
          <div className="text-xs text-gray-500 mt-3">
            预览比例: 1mm ≈ {paperDimensions.scale.toFixed(1)}px | 当前宽度: {paperDimensions.previewWidth}px
          </div>
        </div>
      </div>

      {/* 底部小贴士区域 */}
      <div className="bg-blue-50/20 py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center mb-4">
            <span className="text-lg font-medium text-indigo-600 mr-2">💡</span>
            <h3 className="text-lg font-medium text-gray-700">小贴士</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <span className="text-blue-600 p-1 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </span>
                <h3 className="font-medium text-gray-700">自定义模板</h3>
              </div>
              <p className="text-gray-600 text-sm">您可以通过调整界面中的各项参数，创建完全符合您要求的纸张模板，点击"导出设置"可以保存您的自定义模板。</p>
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <span className="text-green-600 p-1 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                </span>
                <h3 className="font-medium text-gray-700">打印建议</h3>
              </div>
              <p className="text-gray-600 text-sm">生成PDF后，建议使用高质量打印机进行打印。对于彩色模板，请确保使用彩色打印。双面打印可以节省纸张。</p>
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <span className="text-purple-600 p-1 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </span>
                <h3 className="font-medium text-gray-700">创意用途</h3>
              </div>
              <p className="text-gray-600 text-sm">我们的纸张模板不仅适用于笔记和学习，还可用于日记、绘画、项目管理等多种用途。发挥您的创意力！</p>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white py-3 border-t text-center text-gray-500 text-sm">
        <p>&copy; 2024 纸由我 PaperMe. 保留所有权利。</p>
      </footer>
    </div>
  );
}
