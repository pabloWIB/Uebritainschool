const SHEET_NAME = 'Contactos Britain School';
const TIMEZONE = 'America/Guayaquil';

function doPost(e) {
    try {
        const sheet = getOrCreateSheet();
        const data = JSON.parse(e.postData.contents);

        sheet.appendRow([
            Utilities.formatDate(new Date(), TIMEZONE, 'dd/MM/yyyy'),
            Utilities.formatDate(new Date(), TIMEZONE, 'HH:mm:ss'),
            data.user_name || '',
            data.user_email || '',
            data.user_phone || '',
            data.subject || '',
            data.message || ''
        ]);

        return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            message: 'Datos guardados correctamente'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

function getOrCreateSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAME);

        const headers = ['Fecha', 'Hora', 'Nombre', 'Email', 'Teléfono', 'Asunto', 'Mensaje'];
        sheet.appendRow(headers);

        const headerRange = sheet.getRange('A1:G1');
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#2f2b63');
        headerRange.setFontColor('#ffffff');

        sheet.setColumnWidth(1, 100);
        sheet.setColumnWidth(2, 80);
        sheet.setColumnWidth(3, 200);
        sheet.setColumnWidth(4, 250);
        sheet.setColumnWidth(5, 150);
        sheet.setColumnWidth(6, 200);
        sheet.setColumnWidth(7, 400);
    }

    return sheet;
}

function test() {
    const testData = {
        postData: {
            contents: JSON.stringify({
                user_name: 'Juan Pérez',
                user_email: 'juan@example.com',
                user_phone: '+593 99 999 9999',
                subject: 'Información de Admisiones',
                message: 'Me gustaría obtener más información sobre el proceso de admisión.'
            })
        }
    };

    const result = doPost(testData);
    Logger.log(result.getContent());
}