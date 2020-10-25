const fs = require('fs');

class LogCreator  {
    createFile = (fileName, fileContent) => {
        fs.appendFile(`logs/${fileName}`, `\n${fileContent}`, () => {
            // console.log(`Created log file: ${fileName}`);
        });
    };
}

module.exports = LogCreator;
