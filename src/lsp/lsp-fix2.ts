interface FileReader {
    download(fileName: string): void;
}

interface FileUploader {
    upload(fileName: string): void;
}

interface FileDeleter {
    delete(fileName: string): void;
}



class LocalFileStorage implements FileUploader, FileReader, FileDeleter {
    upload(filename: string): void {
        console.log(`Uploading ${filename} to local file storage`);
    }

    download(filename: string): void {
        console.log(`Downloading ${filename} from local file storage`);
    }

    delete(filename: string): void {
        console.log(`Deleting ${filename} from local file storage`);
    }
}

class ReadOnlyCloudFileStorage implements FileReader {
    download(filename: string): void {
        console.log(`Downloading ${filename} from read-only cloud file storage`);
    }
}

// Business Function
function downloadDocument(storage: FileReader, fileName: string): void {
    storage.download(fileName);
}

function replaceDocument(storage: FileUploader & FileDeleter & FileReader, fileName: string): void {
    storage.delete(fileName);
    storage.upload(fileName);
}

// Usage
const localStorage = new LocalFileStorage();
downloadDocument(localStorage, "file1.txt");

const readOnlyCloudStorage = new ReadOnlyCloudFileStorage();
downloadDocument(readOnlyCloudStorage, "file2.txt");
// replaceDocument(readOnlyCloudStorage, "file3.txt"); // compile time error: ReadOnlyCloudFileStorage does not implement FileUploader and FileDeleter