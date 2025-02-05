import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Book } from 'lucide-react';
import JSZip from 'jszip';
import { marked } from 'marked';

const MarkdownToEpub = () => {
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  
  // 处理文件选择
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.md')) {
      setFile(selectedFile);
    } else {
      alert('请选择 Markdown 文件 (.md)');
    }
  };

  // 生成 container.xml
  const generateContainerXml = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
          <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
        </rootfiles>
      </container>`;
  };

  // 生成 content.opf
  const generateContentOpf = (title) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
          <dc:title>${title}</dc:title>
          <dc:language>zh</dc:language>
          <dc:identifier id="BookID">urn:uuid:${crypto.randomUUID()}</dc:identifier>
        </metadata>
        <manifest>
          <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
          <item id="content" href="content.html" media-type="application/xhtml+xml"/>
        </manifest>
        <spine toc="ncx">
          <itemref idref="content"/>
        </spine>
      </package>`;
  };

  // 生成 toc.ncx
  const generateTocNcx = (title) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
        <head>
          <meta name="dtb:uid" content="urn:uuid:${crypto.randomUUID()}"/>
          <meta name="dtb:depth" content="1"/>
          <meta name="dtb:totalPageCount" content="0"/>
          <meta name="dtb:maxPageNumber" content="0"/>
        </head>
        <docTitle><text>${title}</text></docTitle>
        <navMap>
          <navPoint id="navpoint-1" playOrder="1">
            <navLabel><text>${title}</text></navLabel>
            <content src="content.html"/>
          </navPoint>
        </navMap>
      </ncx>`;
  };

  // 转换 Markdown 为 HTML
  const convertMarkdownToHtml = (markdown) => {
    const html = marked(markdown);
    return `<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title>Content</title>
          <style>
            body { margin: 5%; font-family: serif; }
            h1, h2, h3, h4, h5, h6 { font-family: sans-serif; }
            code { font-family: monospace; }
          </style>
        </head>
        <body>${html}</body>
      </html>`;
  };

  // 处理转换过程
  const handleConvert = async () => {
    if (!file) {
      alert('请先选择 Markdown 文件');
      return;
    }

    setConverting(true);
    try {
      // 读取文件内容
      const content = await file.text();
      const title = file.name.replace('.md', '');

      // 创建 ZIP 文件
      const zip = new JSZip();
      
      // 添加 mimetype 文件
      zip.file('mimetype', 'application/epub+zip');
      
      // 添加 META-INF/container.xml
      zip.file('META-INF/container.xml', generateContainerXml());
      
      // 添加 OEBPS 目录下的文件
      zip.file('OEBPS/content.opf', generateContentOpf(title));
      zip.file('OEBPS/toc.ncx', generateTocNcx(title));
      zip.file('OEBPS/content.html', convertMarkdownToHtml(content));

      // 生成 EPUB 文件
      const epubBlob = await zip.generateAsync({type: 'blob', mimeType: 'application/epub+zip'});
      
      // 创建下载链接
      const downloadUrl = URL.createObjectURL(epubBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${title}.epub`;
      
      // 触发下载
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error('转换过程出错:', error);
      alert('转换过程出错，请查看控制台获取详细信息');
    } finally {
      setConverting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Markdown 转 EPUB</CardTitle>
        <CardDescription>
          选择 Markdown 文件，一键转换为 EPUB 电子书格式
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => document.getElementById('fileInput').click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            选择 Markdown 文件
          </Button>
          <input
            id="fileInput"
            type="file"
            accept=".md"
            className="hidden"
            onChange={handleFileSelect}
          />
          {file && (
            <div className="text-sm text-gray-500">
              已选择文件: {file.name}
            </div>
          )}
          <Button 
            className="w-full" 
            onClick={handleConvert}
            disabled={!file || converting}
          >
            <Book className="mr-2 h-4 w-4" />
            {converting ? '转换中...' : '转换为 EPUB'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarkdownToEpub;