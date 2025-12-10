import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export class AudioConverterService {
  /**
   * Convert audio file to OGG (Opus) format for WhatsApp
   * @param inputPath Path to input audio file (WebM, MP3, M4A, etc.)
   * @param outputPath Path for output OGG file
   * @returns Promise<void>
   */
  static async convertToOgg(inputPath: string, outputPath: string): Promise<void> {
    try {
      // Try to find FFmpeg - check multiple locations
      let ffmpegCommand = 'ffmpeg';
      
      // On Windows, try Scoop path first
      if (process.platform === 'win32') {
        const scoopPath = path.join(process.env.USERPROFILE || '', 'scoop', 'shims', 'ffmpeg.exe');
        try {
          await execAsync(`"${scoopPath}" -version`);
          ffmpegCommand = `"${scoopPath}"`;
          console.log('✅ FFmpeg detected (Scoop)');
        } catch {
          // Try system PATH
          try {
            await execAsync('ffmpeg -version');
            ffmpegCommand = 'ffmpeg';
            console.log('✅ FFmpeg detected (PATH)');
          } catch {
            console.error('❌ FFmpeg not found');
            console.error('Tried locations:');
            console.error(`  - ${scoopPath}`);
            console.error('  - System PATH');
            throw new Error('FFmpeg is required for audio conversion. Please install FFmpeg: scoop install ffmpeg');
          }
        }
      } else {
        // On Linux/Mac, just use PATH
        try {
          await execAsync('ffmpeg -version');
          console.log('✅ FFmpeg detected');
        } catch {
          throw new Error('FFmpeg is required for audio conversion. Please install FFmpeg.');
        }
      }

      // Convert to OGG with Opus codec
      const command = `${ffmpegCommand} -i "${inputPath}" -c:a libopus -b:a 64k -ac 1 "${outputPath}" -y`;
      
      console.log('🔄 Converting audio:', {
        input: path.basename(inputPath),
        output: path.basename(outputPath)
      });

      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('Output #0')) {
        console.warn('FFmpeg stderr:', stderr);
      }

      console.log('✅ Audio converted successfully');
    } catch (error: any) {
      console.error('❌ Audio conversion failed:', error.message);
      throw new Error(`Audio conversion failed: ${error.message}. Voice messages require FFmpeg to convert WebM to OGG format.`);
    }
  }

  /**
   * Check if audio file needs conversion
   * @param mimeType MIME type of the audio file
   * @returns boolean
   */
  static needsConversion(mimeType: string): boolean {
    // WhatsApp supports: audio/ogg (opus), audio/mpeg, audio/mp4, audio/aac, audio/amr
    // Needs conversion: audio/webm, audio/wav, etc.
    const supportedTypes = [
      'audio/ogg',
      'audio/mpeg',
      'audio/mp4',
      'audio/aac',
      'audio/amr'
    ];

    return !supportedTypes.some(type => mimeType.includes(type));
  }

  /**
   * Get output filename with .ogg extension
   * @param originalFilename Original filename
   * @returns string
   */
  static getOggFilename(originalFilename: string): string {
    const nameWithoutExt = path.parse(originalFilename).name;
    return `${nameWithoutExt}.ogg`;
  }
}
