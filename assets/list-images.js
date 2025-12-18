const fs = require('fs');
const path = require('path');

// Ruta de la carpeta actual
const assetsPath = __dirname;

// Leer todos los archivos en la carpeta actual
fs.readdir(assetsPath, (err, files) => {
    if (err) {
        console.error('Error al leer la carpeta:', err);
        return;
    }

    // Filtrar solo imágenes (jpg, jpeg, png, gif, webp, svg)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const images = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
    });

    // Crear objeto con información
    const imageData = {
        total: images.length,
        images: images.sort()
    };

    // Guardar en JSON
    const outputPath = path.join(__dirname, 'downloaded-images.json');
    fs.writeFileSync(outputPath, JSON.stringify(imageData, null, 2), 'utf8');

    console.log(`✓ JSON generado: ${outputPath}`);
    console.log(`✓ Total de imágenes encontradas: ${images.length}`);
    console.log('\nImágenes:');
    images.forEach((img, i) => console.log(`  ${i + 1}. ${img}`));
});