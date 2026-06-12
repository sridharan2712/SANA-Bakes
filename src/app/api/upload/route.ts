import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import path from 'path';
import fs from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_key_for_development_purposes'
);

async function getUserId(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.id as string;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file format. Only JPG, PNG, WEBP allowed.' }, { status: 400 });
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Check if Cloudinary is configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const uploadToCloudinary = (fileBuffer: Buffer) => {
        return new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'bakes_payments',
              resource_type: 'image'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(fileBuffer);
        });
      };

      const uploadResult = await uploadToCloudinary(buffer);
      return NextResponse.json({ 
        success: true, 
        path: uploadResult.secure_url 
      });
    }

    // Production fallback: return Base64 data URL if Cloudinary is not configured
    if (process.env.NODE_ENV === 'production') {
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
      return NextResponse.json({
        success: true,
        path: base64Image
      });
    }

    // Fallback: Local Filesystem Storage (Development)
    const ext = path.extname(file.name) || (file.type === 'image/jpeg' ? '.jpg' : file.type === 'image/png' ? '.png' : '.webp');
    const filename = `${Date.now()}_${userId.substring(0, 8)}${ext}`;
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, buffer);

    return NextResponse.json({ 
      success: true, 
      path: `/uploads/${filename}` 
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload screenshot' }, { status: 500 });
  }
}
