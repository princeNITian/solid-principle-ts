"use strict";
// Business Scenario: File storage service that allows users to upload, download, and delete files.
Object.defineProperty(exports, "__esModule", { value: true });
class FileStorage {
    upload(filename) {
        console.log(`Uploading ${filename} to file storage`);
    }
    download(filename) {
        console.log(`Downloading ${filename} from file storage`);
    }
    delete(filename) {
        console.log(`Deleting ${filename} from file storage`);
    }
}
class LocalFileStorage extends FileStorage {
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
class CloudFileStorage extends FileStorage {
    upload(filename) {
        console.log(`Uploading ${filename} to cloud file storage`);
    }
    download(filename) {
        console.log(`Downloading ${filename} from cloud file storage`);
    }
    delete(filename) {
        console.log(`Deleting ${filename} from cloud file storage`);
    }
}
// Function that replaces a file in storage by deleting the old one and uploading a new one
function replaceDocument(storage, fileName) {
    storage.delete(fileName);
    storage.upload(fileName);
}
// Usage
const localStorage = new LocalFileStorage();
localStorage.upload("file1.txt");
localStorage.download("file1.txt");
localStorage.delete("file1.txt");
const cloudStorage = new CloudFileStorage();
cloudStorage.upload("file2.txt");
cloudStorage.download("file2.txt");
cloudStorage.delete("file2.txt");
// Now Let's add ReadOnlyArchiveStorage that only allows downloading files without modifying the existing FileStorage class.
class ReadOnlyArchiveStorage extends FileStorage {
    download(filename) {
        console.log(`Downloading ${filename} from read-only archive storage`);
    }
    // Override the upload and delete methods to prevent modifications
    upload(filename) {
        throw new Error("Upload operation is not allowed in read-only archive storage");
    }
    delete(filename) {
        throw new Error("Delete operation is not allowed in read-only archive storage");
    }
}
// Usage of ReadOnlyArchiveStorage
const archiveStorage = new ReadOnlyArchiveStorage();
archiveStorage.download("file3.txt");
archiveStorage.upload("file3.txt"); // This will throw an error
archiveStorage.delete("file3.txt"); // This will throw an error  
// Verdict: The ReadOnlyArchiveStorage class violates the Liskov Substitution Principle (LSP) because it changes the expected behavior of the FileStorage class. The upload and delete methods are overridden to throw errors, which means that instances of ReadOnlyArchiveStorage cannot be used interchangeably with instances of FileStorage without breaking the expected behavior. This violates the principle that subclasses should be substitutable for their base classes without altering the correctness of the program.
