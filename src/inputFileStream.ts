import * as fs from 'fs';
import readline from 'readline';
import StreamingService from './streams/streaming.service';

const streamingService = StreamingService.getInstance();

function streamFilesInDirectory(path_directory: string) {
  fs.stat(path_directory, (err, stat) => {
    if (!err) {
      if (stat.isDirectory()) {
        fs.readdirSync(path_directory).forEach((file) => {
          const rl = readline.createInterface({
            input: fs.createReadStream(path_directory + file),
            crlfDelay: Infinity,
          });
          rl.on('line', (line) => {
            streamingService.processStream(JSON.parse(line));
          });
        });
        console.log();
      }
    } else {
      console.log(err);
    }
  });
}

streamFilesInDirectory('./src/inputFiles/');
