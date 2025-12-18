const fs = require('fs');
const path = require('path');

class SEOAnalyzer {
  constructor(rootDir = './') {
    this.rootDir = rootDir;
    this.results = {
      timestamp: new Date().toISOString(),
      files: {
        html: [],
        images: [],
        css: [],
        js: []
      },
      seo: {
        missingMetaTags: [],
        missingAltText: [],
        brokenLinks: [],
        emptyTitles: [],
        duplicateTitles: [],
        largeSizedImages: []
      },
      structure: {
        totalFiles: 0,
        totalSize: 0,
        totalSizeMB: 0,
        depth: 0
      },
      recommendations: {
        htaccess: null,
        robotsTxt: null,
        sitemap: null,
        error404: null
      }
    };
  }

  // Escanear directorio recursivamente
  scanDirectory(dir, depth = 0) {
    const files = fs.readdirSync(dir);
    
    if (depth > this.results.structure.depth) {
      this.results.structure.depth = depth;
    }

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      // Ignorar node_modules y carpetas ocultas
      if (file === 'node_modules' || file.startsWith('.')) return;

      if (stat.isDirectory()) {
        this.scanDirectory(filePath, depth + 1);
      } else {
        this.analyzeFile(filePath, stat);
      }
    });
  }

  // Analizar archivo individual
  analyzeFile(filePath, stat) {
    const ext = path.extname(filePath).toLowerCase();
    const relativePath = path.relative(this.rootDir, filePath);
    
    this.results.structure.totalFiles++;
    this.results.structure.totalSize += stat.size;

    const fileInfo = {
      path: relativePath.replace(/\\/g, '/'),
      size: stat.size,
      sizeKB: parseFloat((stat.size / 1024).toFixed(2))
    };

    // Clasificar por tipo
    if (ext === '.html' || ext === '.htm') {
      this.results.files.html.push(fileInfo);
      this.analyzeHTML(filePath, fileInfo.path);
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
      this.results.files.images.push(fileInfo);
      if (stat.size > 500000) { // > 500KB
        this.results.seo.largeSizedImages.push({
          path: fileInfo.path,
          sizeKB: fileInfo.sizeKB
        });
      }
    } else if (ext === '.css') {
      this.results.files.css.push(fileInfo);
    } else if (ext === '.js') {
      this.results.files.js.push(fileInfo);
    }
  }

  // Analizar contenido HTML
  analyzeHTML(filePath, relativePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Verificar título
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
      this.results.seo.emptyTitles.push(relativePath);
    }

    // Verificar meta description
    if (!content.match(/<meta[^>]*name=["']description["'][^>]*>/i)) {
      this.results.seo.missingMetaTags.push({
        file: relativePath,
        missing: 'meta description'
      });
    }

    // Verificar meta viewport
    if (!content.match(/<meta[^>]*name=["']viewport["'][^>]*>/i)) {
      this.results.seo.missingMetaTags.push({
        file: relativePath,
        missing: 'meta viewport'
      });
    }

    // Verificar imágenes sin alt
    const imgRegex = /<img[^>]*>/gi;
    const images = content.match(imgRegex) || [];
    images.forEach(img => {
      if (!img.match(/alt=["'][^"']*["']/i)) {
        this.results.seo.missingAltText.push({
          file: relativePath,
          tag: img.substring(0, 100)
        });
      }
    });

    // Detectar enlaces rotos (básico)
    const linkRegex = /href=["']([^"']+)["']/gi;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const link = match[1];
      if (link.startsWith('./') || link.startsWith('../') || (!link.startsWith('http') && !link.startsWith('#') && !link.startsWith('mailto:'))) {
        const linkedPath = path.resolve(path.dirname(filePath), link);
        if (!fs.existsSync(linkedPath)) {
          this.results.seo.brokenLinks.push({
            file: relativePath,
            link: link
          });
        }
      }
    }
  }

  // Generar recomendaciones
  generateRecommendations() {
    const hasHtaccess = fs.existsSync(path.join(this.rootDir, '.htaccess'));
    const hasRobots = fs.existsSync(path.join(this.rootDir, 'robots.txt'));
    const hasSitemap = fs.existsSync(path.join(this.rootDir, 'sitemap.xml'));
    const has404 = this.results.files.html.some(f => 
      f.path.includes('404') || f.path.toLowerCase().includes('error')
    );

    // Recomendación .htaccess
    this.results.recommendations.htaccess = {
      exists: hasHtaccess,
      status: hasHtaccess ? 'Encontrado' : 'No encontrado - Recomendado crear'
    };

    // Recomendación robots.txt
    this.results.recommendations.robotsTxt = {
      exists: hasRobots,
      status: hasRobots ? 'Encontrado' : 'No encontrado - Recomendado crear'
    };

    // Recomendación sitemap.xml
    this.results.recommendations.sitemap = {
      exists: hasSitemap,
      status: hasSitemap ? 'Encontrado' : 'No encontrado - Recomendado crear',
      pagesFound: this.results.files.html.length
    };

    // Recomendación página 404
    this.results.recommendations.error404 = {
      exists: has404,
      status: has404 ? 'Encontrada' : 'No encontrada - Recomendado crear'
    };
  }

  // Ejecutar análisis completo
  analyze() {
    console.log('🔍 Iniciando análisis del proyecto...\n');
    
    this.scanDirectory(this.rootDir);
    this.generateRecommendations();
    
    // Calcular tamaño total en MB
    this.results.structure.totalSizeMB = parseFloat(
      (this.results.structure.totalSize / (1024 * 1024)).toFixed(2)
    );

    // Guardar resultados en JSON
    const outputPath = path.join(this.rootDir, 'seo-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2), 'utf-8');
    
    console.log('✅ Análisis completado!');
    console.log(`📊 Total de archivos: ${this.results.structure.totalFiles}`);
    console.log(`📁 Archivos HTML: ${this.results.files.html.length}`);
    console.log(`🖼️  Imágenes: ${this.results.files.images.length}`);
    console.log(`💾 Tamaño total: ${this.results.structure.totalSizeMB} MB`);
    console.log(`\n⚠️  Problemas SEO encontrados:`);
    console.log(`   - Meta tags faltantes: ${this.results.seo.missingMetaTags.length}`);
    console.log(`   - Imágenes sin ALT: ${this.results.seo.missingAltText.length}`);
    console.log(`   - Enlaces rotos: ${this.results.seo.brokenLinks.length}`);
    console.log(`   - Títulos vacíos: ${this.results.seo.emptyTitles.length}`);
    console.log(`   - Imágenes grandes (>500KB): ${this.results.seo.largeSizedImages.length}`);
    console.log(`\n📄 Reporte guardado en: ${outputPath}\n`);
    
    return this.results;
  }
}

// Ejecutar análisis
const analyzer = new SEOAnalyzer('./');
analyzer.analyze();