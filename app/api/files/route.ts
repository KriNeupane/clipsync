import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const uploadDir = path.join(process.cwd(), 'uploads');

        if (!fs.existsSync(uploadDir)) {
            return NextResponse.json({ files: [] });
        }

        const files = await fs.promises.readdir(uploadDir);
        // Filter out potential system files or hidden files if needed
        const visibleFiles = files.filter(f => !f.startsWith('.'));

        return NextResponse.json({ files: visibleFiles });
    } catch (error) {
        console.error('Error listing files:', error);
        return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            return NextResponse.json({ success: true });
        }

        const { searchParams } = new URL(req.url);
        const filename = searchParams.get('filename');

        if (filename) {
            // Delete specific file
            const filePath = path.join(uploadDir, filename);
            // Prevent directory traversal attacks
            if (!filePath.startsWith(uploadDir)) {
                return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
            }
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        } else {
            // Delete ALL files (logic for the 'Clear All' button if we keep it, or legacy)
            const files = await fs.promises.readdir(uploadDir);
            for (const file of files) {
                await fs.promises.unlink(path.join(uploadDir, file));
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Clear error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
