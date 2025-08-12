import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10000000'), // 10MB default
  },
  fileFilter,
});

// Upload single file
export const uploadSingle = upload.single('file');

// Upload multiple files
export const uploadMultiple = upload.array('files', 5);

// Upload to Cloudinary
export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string = 'rental-management',
  resourceType: 'image' | 'raw' = 'image'
): Promise<string> => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return result.secure_url;
  } catch (error) {
    throw new Error(`Failed to upload to Cloudinary: ${error}`);
  }
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Failed to delete from Cloudinary: ${error}`);
  }
};

// Middleware for handling single file upload
export const handleSingleUpload = (folderName: string = 'products') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        const resourceType = req.file.mimetype.startsWith('image/') ? 'image' : 'raw';
        const imageUrl = await uploadToCloudinary(req.file.buffer, folderName, resourceType);
        req.body.imageUrl = imageUrl;
      }
      next();
    } catch (error) {
      res.status(500).json({ message: `Upload failed: ${error}` });
    }
  };
};

// Middleware for handling multiple file uploads
export const handleMultipleUpload = (folderName: string = 'documents') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.files && Array.isArray(req.files)) {
        const uploadPromises = req.files.map(async (file: Express.Multer.File) => {
          const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw';
          return await uploadToCloudinary(file.buffer, folderName, resourceType);
        });

        const imageUrls = await Promise.all(uploadPromises);
        req.body.imageUrls = imageUrls;
      }
      next();
    } catch (error) {
      res.status(500).json({ message: `Upload failed: ${error}` });
    }
  };
};

// File upload service class
export class UploadService {
  static async uploadProductImage(buffer: Buffer): Promise<string> {
    return uploadToCloudinary(buffer, 'products', 'image');
  }

  static async uploadDocument(buffer: Buffer): Promise<string> {
    return uploadToCloudinary(buffer, 'documents', 'raw');
  }

  static async uploadUserAvatar(buffer: Buffer): Promise<string> {
    return uploadToCloudinary(buffer, 'avatars', 'image');
  }

  static async deleteFile(publicId: string): Promise<void> {
    return deleteFromCloudinary(publicId);
  }

  // Extract public ID from Cloudinary URL
  static extractPublicId(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }

  // Generate optimized image URL
  static getOptimizedImageUrl(url: string, width?: number, height?: number): string {
    if (!url.includes('cloudinary.com')) return url;
    
    let transformation = 'c_fill,f_auto,q_auto';
    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;
    
    return url.replace('/upload/', `/upload/${transformation}/`);
  }

  // Generate thumbnail URL
  static getThumbnailUrl(url: string): string {
    return this.getOptimizedImageUrl(url, 300, 300);
  }
}

export const uploadService = new UploadService();