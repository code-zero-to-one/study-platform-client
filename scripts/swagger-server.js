#!/usr/bin/env node

/**
 * 로컬에서 Swagger UI로 OpenAPI 문서를 볼 수 있는 서버
 * 사용: npm run api:swagger
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Swagger UI 정적 파일 제공
const swaggerUiPath = path.join(__dirname, '../node_modules/swagger-ui-dist');
app.use('/swagger-ui', express.static(swaggerUiPath));

// OpenAPI YAML 파일 제공 (또는 자동 생성 YAML 제공)
app.get('/openapi.yaml', (req, res) => {
  // 먼저 프로젝트 루트의 openapi.yaml을 확인
  let openApiPath = path.join(__dirname, '../openapi.yaml');

  if (!fs.existsSync(openApiPath)) {
    // 없으면 자동 생성된 폴더에서 찾기
    openApiPath = path.join(__dirname, '../src/api/openapi/openapi.yaml');
  }

  if (!fs.existsSync(openApiPath)) {
    // 그것도 없으면 기본 OpenAPI spec 반환
    return res.type('application/yaml').send(`openapi: 3.0.0
info:
  title: Zeroone Study Platform API
  version: 1.0.0
  description: |
    OpenAPI YAML 파일이 없습니다.
    백엔드에서 생성된 OpenAPI 스펙을 프로젝트 루트에 저장해주세요.
    
    또는 http://localhost:3001/api-docs에서 자동 생성된 API 문서를 확인하세요.
paths: {}`);
  }

  res.sendFile(openApiPath);
});

// Swagger UI HTML 페이지
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Zeroone API - Swagger UI</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700">
        <link rel="stylesheet" href="/swagger-ui/swagger-ui.css">
        <style>
          html{
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
          }
          *,
          *:before,
          *:after{
            box-sizing: inherit;
          }
          body {
            margin:0;
            background: #fafafa;
          }
          .info-box {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 4px;
            padding: 15px;
            margin: 20px;
            color: #856404;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
          }
        </style>
      </head>
      <body>
        <div class="info-box">
          <strong>ℹ️ 정보:</strong> OpenAPI YAML 파일이 프로젝트 루트에 없습니다.
          백엔드에서 생성된 OpenAPI 스펙을 프로젝트 루트에 저장하면 여기서 자동으로 표시됩니다.
          현재는 <a href="/api-docs">API 문서</a>를 확인하세요.
        </div>
        <div id="swagger-ui"></div>
        <script src="/swagger-ui/swagger-ui-bundle.js"></script>
        <script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            window.ui = SwaggerUIBundle({
              url: "/openapi.yaml",
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout"
            })
          }
        </script>
      </body>
    </html>
  `);
});

// API 문서 목록 페이지
app.get('/api-docs', (req, res) => {
  const docsPath = path.join(__dirname, '../src/api/openapi/docs');
  
  if (!fs.existsSync(docsPath)) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>API 문서</title>
          <meta charset="utf-8"/>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; margin: 40px; }
            .error { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1>API 문서</h1>
          <div class="error">
            <p>API 문서 폴더를 찾을 수 없습니다: ${docsPath}</p>
            <p>OpenAPI Generator로 생성된 문서가 없습니다.</p>
          </div>
        </body>
      </html>
    `);
  }

  // docs 폴더의 마크다운 파일 목록
  fs.readdir(docsPath, (err, files) => {
    if (err) {
      return res.send(`<h1>오류: ${err.message}</h1>`);
    }

    const mdFiles = files.filter(f => f.endsWith('.md')).sort();
    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>API 문서</title>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
              margin: 0;
              padding: 40px;
              background: #f5f5f5;
            }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            .doc-list { list-style: none; padding: 0; }
            .doc-list li { margin: 10px 0; }
            .doc-list a { 
              display: inline-block;
              padding: 12px 20px;
              background: #1976d2;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              transition: background 0.3s;
            }
            .doc-list a:hover { background: #1565c0; }
            .info { background: #e3f2fd; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0; border-radius: 2px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📚 OpenAPI 자동 생성 문서</h1>
            <div class="info">
              <strong>총 ${mdFiles.length}개의 API 문서</strong>를 찾았습니다.
            </div>
            <ul class="doc-list">
    `;

    mdFiles.forEach(file => {
      const name = file.replace('.md', '');
      html += `<li><a href="/api-docs/${file}">${name}</a></li>`;
    });

    html += `
            </ul>
          </div>
        </body>
      </html>
    `;
    res.send(html);
  });
});

// 마크다운 문서 제공
app.get('/api-docs/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // 파일명 검증 (보안)
  if (!filename.endsWith('.md') || filename.includes('..')) {
    return res.status(400).send('Invalid filename');
  }

  const filePath = path.join(__dirname, '../src/api/openapi/docs', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>문서 없음</title>
          <meta charset="utf-8"/>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; margin: 40px; }
          </style>
        </head>
        <body>
          <h1>404 - 문서를 찾을 수 없습니다</h1>
          <p><a href="/api-docs">문서 목록으로 돌아가기</a></p>
        </body>
      </html>
    `);
  }

  // 마크다운을 HTML로 변환하여 제공 (간단한 변환)
  const content = fs.readFileSync(filePath, 'utf-8');
  const htmlContent = simpleMarkdownToHtml(content);
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
          h1 { color: #333; border-bottom: 3px solid #1976d2; padding-bottom: 10px; }
          h2 { color: #444; margin-top: 30px; }
          h3 { color: #666; }
          code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Monaco', 'Menlo', monospace; }
          pre { background: #f4f4f4; padding: 15px; border-radius: 4px; overflow-x: auto; }
          pre code { padding: 0; background: none; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          table td, table th { border: 1px solid #ddd; padding: 12px; text-align: left; }
          table th { background: #f4f4f4; }
          a { color: #1976d2; }
          .back-link { margin-bottom: 20px; }
          .back-link a { font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="back-link">
            <a href="/api-docs">← 문서 목록으로 돌아가기</a>
          </div>
          ${htmlContent}
        </div>
      </body>
    </html>
  `);
});

// 간단한 마크다운을 HTML로 변환하는 함수
function simpleMarkdownToHtml(markdown) {
  let html = markdown
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .split('\n')
    .map(line => {
      if (line.startsWith('- ')) {
        return '<li>' + line.substring(2) + '</li>';
      }
      return line;
    })
    .join('\n');

  // 리스트 감싸기
  html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
  
  // 단락 감싸기
  if (!html.startsWith('<h') && !html.startsWith('<ul')) {
    html = '<p>' + html + '</p>';
  }

  return html;
}

app.listen(PORT, () => {
  console.log(`
  ✨ Swagger UI 서버가 시작되었습니다!
  
  📖 브라우저에서 열기: http://localhost:${PORT}
  📄 OpenAPI YAML: http://localhost:${PORT}/openapi.yaml
  
  종료: Ctrl + C
  `);
});
