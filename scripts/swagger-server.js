#!/usr/bin/env node

/**
 * 로컬에서 Swagger UI로 OpenAPI 문서를 볼 수 있는 서버
 * 사용: npm run api:swagger
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Swagger UI 정적 파일 제공
const swaggerUiPath = path.join(__dirname, '../node_modules/swagger-ui-dist');
app.use('/swagger-ui', express.static(swaggerUiPath));

// OpenAPI YAML 파일 제공
app.get('/openapi.yaml', (req, res) => {
  const openApiPath = path.join(__dirname, '../openapi.yaml');
  
  if (!fs.existsSync(openApiPath)) {
    return res.status(404).json({
      error: 'openapi.yaml를 찾을 수 없습니다.',
      path: openApiPath,
      hint: 'OpenAPI YAML 파일을 프로젝트 루트에 저장해주세요.'
    });
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
        </style>
      </head>
      <body>
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

app.listen(PORT, () => {
  console.log(`
  ✨ Swagger UI 서버가 시작되었습니다!
  
  📖 브라우저에서 열기: http://localhost:${PORT}
  📄 OpenAPI YAML: http://localhost:${PORT}/openapi.yaml
  
  종료: Ctrl + C
  `);
});
