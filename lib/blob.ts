import { put, list, del } from '@vercel/blob';

/**
 * Upload a file to Vercel Blob Storage
 * @param filename The name of the file to be stored
 * @param file The file to upload (as Blob or File)
 * @param pathname The optional path to store the file in (e.g., 'debts/')
 * @returns The URL of the uploaded file
 */
export async function uploadToBlob(
  filename: string,
  file: Blob | File,
  pathname: string = 'debts/'
): Promise<string> {
  try {
    // Use timestamp to ensure unique filenames
    const timestamp = new Date().getTime();
    const fileExt = filename.split('.').pop();
    const uniqueFilename = `${pathname}${timestamp}-${filename}`;
    
    const { url } = await put(uniqueFilename, file, {
      access: 'public',
    });
    
    return url;
  } catch (error) {
    console.error('Error uploading to blob:', error);
    throw new Error('Failed to upload file to storage');
  }
}

/**
 * List all files in a specific directory in Vercel Blob Storage
 * @param pathname The path to list files from (e.g., 'debts/')
 * @returns Array of objects containing information about the files
 */
export async function listBlobFiles(pathname: string = 'debts/'): Promise<any[]> {
  try {
    const { blobs } = await list({ prefix: pathname });
    return blobs;
  } catch (error) {
    console.error('Error listing blob files:', error);
    throw new Error('Failed to list files from storage');
  }
}

/**
 * Delete a file from Vercel Blob Storage
 * @param url The URL of the file to delete
 * @returns Boolean indicating success
 */
export async function deleteFromBlob(url: string): Promise<boolean> {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error('Error deleting from blob:', error);
    throw new Error('Failed to delete file from storage');
  }
}
