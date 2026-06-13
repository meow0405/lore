import * as fs from 'fs';

export class MetricsEngine {
  public calculateHalsteadVolume(filePath: string): number {
    if (!fs.existsSync(filePath)) return 0;
    const content = fs.readFileSync(filePath, 'utf8');
    
    const words = content.split(/[\s(),.;{}]+/);
    const totalTokens = words.filter(w => w.length > 0).length;
    const uniqueTokens = new Set(words.filter(w => w.length > 0)).size;

    if (uniqueTokens === 0) return 0;
    
    const volume = totalTokens * Math.log2(uniqueTokens);
    return parseFloat(volume.toFixed(2));
  }
}
