"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LocalFileStorage {
    upload(filename) {
        console.log(`Uploading ${filename} to local file storage`);
    }
    download(filename) {
        console.log(`Downloading ${filename} from local file storage`);
    }
    delete(filename) {
        console.log(`Deleting ${filename} from local file storage`);
    }
}
class ReadOnlyCloudFileStorage {
    download(filename) {
        console.log(`Downloading ${filename} from read-only cloud file storage`);
    }
}
// Business Function
function downloadDocument(storage, fileName) {
    storage.download(fileName);
}
function replaceDocument(storage, fileName) {
    storage.delete(fileName);
    storage.upload(fileName);
}
// Usage
const localStorage = new LocalFileStorage();
downloadDocument(localStorage, "file1.txt");
const readOnlyCloudStorage = new ReadOnlyCloudFileStorage();
downloadDocument(readOnlyCloudStorage, "file2.txt");
// replaceDocument(readOnlyCloudStorage, "file3.txt"); // compile time error: ReadOnlyCloudFileStorage does not implement FileUploader and FileDeleter
