interface FileHandleMap {
  [key: string]: FileSystemFileHandle;
}

const fileHandles: FileHandleMap = {};

export async function openFile(
  key: string,
  type: { friendlyName: string; mimeType: string; extension: string }
): Promise<string> {
  if (type.extension[0] !== ".") type.extension = "." + type.extension;

  if ("showOpenFilePicker" in window) {
    try {
      console.log("Using File System Access API to open file picker.");
      const [handle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: type.friendlyName,
            accept: { [type.mimeType]: [type.extension] },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      });

      console.log("File handle obtained, storing in fileHandles.");
      fileHandles[key] = handle;

      console.log("Getting file and reading its content.");
      const file = await handle.getFile();
      const content = await file.text();
      console.log("File content read successfully.");
      return content;
    } catch (error) {
      console.error("Error opening file:", error);
      throw new Error("Error opening file: " + error);
    }
  } else {
    console.log("File System Access API not available, using fallback method.");
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = type.extension;

      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          console.error("No file selected");
          reject("No file selected");
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            console.log("File read successfully using FileReader.");
            resolve(reader.result as string);
          } else {
            console.error("File could not be read");
            reject("File could not be read");
          }
        };
        reader.onerror = () => {
          console.error("Error reading file with FileReader:", reader.error);
          reject(reader.error);
        };
        reader.readAsText(file);
      };

      input.click();
    });
  }
}

export async function saveFile(
  key: string,
  content: string,
  suggestedName: string,
  type: { friendlyName: string; mimeType: string; extension: string }
): Promise<void> {
  if (type.extension[0] !== ".") type.extension = "." + type.extension;

  if ("showSaveFilePicker" in window) {
    try {
      let handle: FileSystemFileHandle;

      if (fileHandles[key]) {
        console.log("Using previously saved file handle.");
        handle = fileHandles[key];
      } else {
        console.log("Creating new file handle using File System Access API.");
        handle = await (window as any).showSaveFilePicker({
          suggestedName: suggestedName,
          types: [
            {
              description: type.friendlyName,
              accept: { [type.mimeType]: [type.extension] },
            },
          ],
        });
        fileHandles[key] = handle;
      }

      console.log("Creating writable stream and writing content to file.");
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      console.log("File saved successfully.");
    } catch (error) {
      console.error("Error saving file:", error);
    }
  } else {
    console.log("File System Access API not available, using fallback method to download file.");
    const blob = new Blob([content], { type: type.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("File downloaded successfully.");
  }
}
