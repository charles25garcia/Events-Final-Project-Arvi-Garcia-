const xl = require('excel4node');
const util = require('util');

class ExcelExportService {
    constructor(fileName, data) {
        this.filePath = `exportedFiles/${fileName}.xlsx`;
        this.data = data;
        this.fileName = fileName;
    }
    async export() {
        try {
            
            const workbook = new xl.Workbook();
            const sheet = workbook.addWorksheet(this.fileName);
            workbook.writeP = util.promisify(workbook.write);
            
            sheet.cell(1, 1).string('Member Name');
            sheet.cell(1, 2).string('Time-In');
            sheet.cell(1, 3).string('Time-Out');

            this.data.memberAttendance.forEach((i, dataIndex) => {

                const rowCell = dataIndex + 2;
                sheet.cell(rowCell, 1).string(i.name);
                sheet.cell(rowCell, 2).date(i.timeIn.toString());
                sheet.cell(rowCell, 3).date(i.timeOut.toString());

            });
            
            await workbook.writeP(this.filePath);
            console.log(`The file has been successfully saved.`);
        } catch (err) {
            console.log(`Failed to export file.`);
        }

    }
}

module.exports = ExcelExportService;
